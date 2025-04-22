/*
  # Add Programme Management and Set Logging

  1. New Tables
    - programmes (workout programmes)
      - id, user_id, name, description, order_index, timestamps
    - workout_programmes (junction table)
      - workout_id, programme_id, order_index
    - set_logs (individual set tracking)
      - id, exercise_log_id, set details, scores, timestamps
    - exercise_links (linked exercises)
      - id, primary/linked exercise IDs, timestamps

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  3. Relationships
    - programmes -> profiles (user_id)
    - workout_programmes -> programmes, workouts
    - set_logs -> exercise_logs
    - exercise_links -> exercises (both primary and linked)
*/

-- Create programmes table
CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout_programmes junction table
CREATE TABLE IF NOT EXISTS workout_programmes (
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  programme_id uuid REFERENCES programmes(id) ON DELETE CASCADE NOT NULL,
  order_index integer NOT NULL,
  PRIMARY KEY (workout_id, programme_id)
);

-- Create set_logs table
CREATE TABLE IF NOT EXISTS set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id uuid REFERENCES exercise_logs(id) ON DELETE CASCADE NOT NULL,
  set_number integer NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  success boolean DEFAULT false NOT NULL,
  pain_score integer CHECK (pain_score >= 0 AND pain_score <= 10),
  difficulty_score integer CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exercise_links table
CREATE TABLE IF NOT EXISTS exercise_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  linked_exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_exercises CHECK (primary_exercise_id != linked_exercise_id)
);

-- Enable Row Level Security
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_links ENABLE ROW LEVEL SECURITY;

-- Create policies for programmes
CREATE POLICY "Users can manage their own programmes"
  ON programmes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for workout_programmes
CREATE POLICY "Users can manage workout programmes they own"
  ON workout_programmes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM programmes
    WHERE programmes.id = workout_programmes.programme_id
    AND programmes.user_id = auth.uid()
  ));

-- Create policies for set_logs
CREATE POLICY "Users can manage their set logs"
  ON set_logs FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM exercise_logs
    JOIN workout_sessions ON workout_sessions.id = exercise_logs.session_id
    WHERE exercise_logs.id = set_logs.exercise_log_id
    AND workout_sessions.user_id = auth.uid()
  ));

-- Create policies for exercise_links
CREATE POLICY "Users can manage their exercise links"
  ON exercise_links FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM exercises e1
    JOIN workouts w1 ON w1.id = e1.workout_id
    WHERE e1.id = exercise_links.primary_exercise_id
    AND w1.user_id = auth.uid()
  ));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_programmes_programme_id ON workout_programmes(programme_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_log_id ON set_logs(exercise_log_id);
CREATE INDEX IF NOT EXISTS idx_exercise_links_primary_exercise_id ON exercise_links(primary_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_links_linked_exercise_id ON exercise_links(linked_exercise_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_programmes_updated_at
  BEFORE UPDATE ON programmes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_set_logs_updated_at
  BEFORE UPDATE ON set_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_links_updated_at
  BEFORE UPDATE ON exercise_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();