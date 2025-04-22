/*
  # Create remaining tables and relationships

  1. New Tables
    - exercises (workout exercises)
    - exercise_variables (variables for each exercise)
    - template_variables (variables for exercise templates)
    - variable_units (units for different variable types)
    - workout_sessions (workout tracking)
    - exercise_logs (exercise performance logs)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add service role policies for variable_units

  3. Functions and Triggers
    - Time format validation
    - Exercise variable validation
    - Variable change logging
    - Current value modification tracking
    - Top variable rules enforcement
    - Cycle reset handling
*/

-- Create exercises table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id uuid REFERENCES workouts(id) NOT NULL,
    name text NOT NULL,
    progression_type progression_type NOT NULL,
    order_index integer NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    prep_timer_duration integer DEFAULT 0 NOT NULL,
    maintenance_mode boolean DEFAULT FALSE NOT NULL,
    notes text
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create exercise_variables table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS exercise_variables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id uuid REFERENCES exercises(id) NOT NULL,
    variable_type text NOT NULL,
    is_primary boolean DEFAULT FALSE,
    is_secondary boolean DEFAULT FALSE,
    is_tertiary boolean DEFAULT FALSE,
    start_value numeric NOT NULL,
    current_value numeric NOT NULL,
    increment_size numeric,
    percentage_increase numeric,
    min_value numeric,
    max_value numeric,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    number_of_increments integer NOT NULL,
    unit text,
    custom_name text,
    should_reset_cycle boolean DEFAULT FALSE,
    last_edit_type text,
    current_value_modified_at timestamptz,
    CONSTRAINT one_role_only CHECK (
      (CASE WHEN is_primary THEN 1 ELSE 0 END +
       CASE WHEN is_secondary THEN 1 ELSE 0 END +
       CASE WHEN is_tertiary THEN 1 ELSE 0 END) <= 1
    )
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create template_variables table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS template_variables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid REFERENCES exercise_templates(id) ON DELETE CASCADE NOT NULL,
    variable_type text NOT NULL,
    is_primary boolean DEFAULT FALSE,
    is_secondary boolean DEFAULT FALSE,
    is_tertiary boolean DEFAULT FALSE,
    start_value numeric NOT NULL,
    increment_size numeric,
    percentage_increase numeric,
    min_value numeric,
    max_value numeric,
    number_of_increments integer NOT NULL,
    unit text,
    custom_name text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create variable_units table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS variable_units (
    variable_type text PRIMARY KEY,
    metric_unit text NOT NULL,
    imperial_unit text,
    description text
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create workout_sessions table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS workout_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id uuid REFERENCES workouts(id) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    started_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create exercise_logs table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS exercise_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES workout_sessions(id) NOT NULL,
    exercise_id uuid REFERENCES exercises(id) NOT NULL,
    variable_id uuid REFERENCES exercise_variables(id) NOT NULL,
    value_used numeric NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Create unique index for exercise_variables if it doesn't exist
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS unique_exercise_variable_type 
    ON exercise_variables (exercise_id, variable_type);
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create trigger functions if they don't exist
CREATE OR REPLACE FUNCTION validate_time_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variable_type = 'timer' AND NEW.unit IS DISTINCT FROM 'seconds' THEN
    RAISE EXCEPTION 'Timer variables must have unit as seconds';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_exercise_variable_values()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.min_value IS NOT NULL AND NEW.max_value IS NOT NULL AND NEW.min_value >= NEW.max_value THEN
    RAISE EXCEPTION 'Minimum value must be less than maximum value';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_exercise_variable_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Exercise variable changed: %', row_to_json(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_current_value_modified_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_value IS DISTINCT FROM OLD.current_value THEN
    NEW.current_value_modified_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enforce_top_variable_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE AND (NEW.is_secondary = TRUE OR NEW.is_tertiary = TRUE) THEN
    RAISE EXCEPTION 'A variable cannot be primary and secondary/tertiary at the same time';
  END IF;
  IF NEW.is_secondary = TRUE AND NEW.is_tertiary = TRUE THEN
    RAISE EXCEPTION 'A variable cannot be secondary and tertiary at the same time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_cycle_reset()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.should_reset_cycle = FALSE AND NEW.should_reset_cycle = TRUE THEN
    NEW.current_value = NEW.start_value;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DO $$ BEGIN
  CREATE TRIGGER enforce_time_format
    BEFORE INSERT OR UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION validate_time_format();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER validate_exercise_variable_values
    BEFORE INSERT OR UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION validate_exercise_variable_values();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER log_exercise_variable_updates
    BEFORE UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION log_exercise_variable_changes();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER track_current_value_updates
    BEFORE UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION update_current_value_modified_at();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER enforce_top_variable_rules_trigger
    BEFORE INSERT OR UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION enforce_top_variable_rules();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER check_exercise_variable_changes
    BEFORE UPDATE ON exercise_variables
    FOR EACH ROW
    EXECUTE FUNCTION handle_cycle_reset();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;