import { supabase } from '@/lib/supabase';

// Types for exercise progression
type ProgressionType = 'single' | 'double' | 'triple';

interface ExerciseVariable {
  id: string;
  exercise_id: string;
  variable_type: string;
  current_value: number;
  start_value: number;
  increment_size?: number;
  percentage_increase?: number;
  min_value?: number;
  max_value?: number;
  number_of_increments: number;
  is_primary: boolean;
  is_secondary: boolean;
  is_tertiary: boolean;
  unit?: string;
  should_reset_cycle: boolean;
}

interface Exercise {
  id: string;
  maintenance_mode: boolean;
  progression_type: ProgressionType;
}

interface SetLog {
  exercise_log_id: string;
  set_number: number;
  completed: boolean;
  success: boolean;
  pain_score?: number;
  difficulty_score?: number;
  notes?: string;
}

// Calculate the sequence of values for a variable
function generateSequence(variable: ExerciseVariable): number[] {
  const sequence: number[] = [variable.start_value];
  let currentValue = variable.start_value;

  for (let i = 0; i < variable.number_of_increments; i++) {
    let nextValue: number;

    if (variable.percentage_increase) {
      nextValue = currentValue * (1 + variable.percentage_increase / 100);
    } else if (variable.increment_size) {
      nextValue = currentValue + variable.increment_size;
    } else {
      break;
    }

    // Apply bounds
    if (variable.max_value !== null && nextValue > variable.max_value) {
      nextValue = variable.max_value;
    }
    if (variable.min_value !== null && nextValue < variable.min_value) {
      nextValue = variable.min_value;
    }

    sequence.push(nextValue);
    currentValue = nextValue;

    // Stop if we've hit the max value
    if (variable.max_value !== null && currentValue >= variable.max_value) {
      break;
    }
  }

  return sequence;
}

// Get the current position in the sequence
function getSequencePosition(variable: ExerciseVariable): { current: number; total: number } {
  const sequence = generateSequence(variable);
  const currentIndex = sequence.findIndex(value => 
    Math.abs(value - variable.current_value) < 0.0001
  );
  
  return {
    current: currentIndex + 1,
    total: sequence.length
  };
}

// Check if a variable has completed its sequence
function isSequenceComplete(variable: ExerciseVariable): boolean {
  const sequence = generateSequence(variable);
  const currentValue = variable.current_value;
  const maxValue = sequence[sequence.length - 1];
  
  return Math.abs(currentValue - maxValue) < 0.0001;
}

// Get the next value in the sequence
function getNextValue(variable: ExerciseVariable): number {
  const sequence = generateSequence(variable);
  const currentIndex = sequence.findIndex(value => 
    Math.abs(value - variable.current_value) < 0.0001
  );
  
  if (currentIndex < sequence.length - 1) {
    return sequence[currentIndex + 1];
  }
  
  return variable.current_value;
}

// Progress a single variable and return if sequence is complete
async function progressVariable(variable: ExerciseVariable): Promise<boolean> {
  if (!variable) return false;

  const nextValue = getNextValue(variable);
  const sequenceComplete = Math.abs(nextValue - variable.current_value) < 0.0001;

  const { error } = await supabase
    .from('exercise_variables')
    .update({ 
      current_value: nextValue,
      current_value_modified_at: new Date().toISOString()
    })
    .eq('id', variable.id);

  if (error) {
    throw new Error(`Failed to update variable: ${error.message}`);
  }

  return sequenceComplete;
}

// Reset a variable to its starting value
async function resetVariable(variable: ExerciseVariable): Promise<void> {
  const { error } = await supabase
    .from('exercise_variables')
    .update({ 
      current_value: variable.start_value,
      should_reset_cycle: true,
      current_value_modified_at: new Date().toISOString()
    })
    .eq('id', variable.id);

  if (error) {
    throw new Error(`Failed to reset variable: ${error.message}`);
  }
}

// Handle progression for linked exercises
async function progressLinkedExercises(exerciseId: string): Promise<void> {
  const { data: links, error: linksError } = await supabase
    .from('exercise_links')
    .select('linked_exercise_id')
    .eq('primary_exercise_id', exerciseId);

  if (linksError) {
    throw new Error(`Failed to fetch linked exercises: ${linksError.message}`);
  }

  for (const link of links || []) {
    await handleExerciseProgression(link.linked_exercise_id, true);
  }
}

// Log exercise completion
async function logExerciseCompletion(
  exerciseId: string,
  sessionId: string,
  variables: ExerciseVariable[],
  sets: SetLog[]
): Promise<void> {
  // Create exercise log entries
  for (const variable of variables) {
    const { error: logError } = await supabase
      .from('exercise_logs')
      .insert({
        session_id: sessionId,
        exercise_id: exerciseId,
        variable_id: variable.id,
        value_used: variable.current_value
      });

    if (logError) {
      throw new Error(`Failed to create exercise log: ${logError.message}`);
    }
  }

  // Create set log entries
  for (const set of sets) {
    const { error: setError } = await supabase
      .from('set_logs')
      .insert(set);

    if (setError) {
      throw new Error(`Failed to create set log: ${setError.message}`);
    }
  }
}

// Main progression handler
export async function handleExerciseProgression(
  exerciseId: string,
  success: boolean,
  sessionId?: string,
  sets?: SetLog[]
): Promise<void> {
  if (!success) return;

  // Fetch exercise details
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single();

  if (exerciseError || !exercise) {
    throw new Error('Failed to fetch exercise');
  }

  if (exercise.maintenance_mode) {
    return; // Skip progression in maintenance mode
  }

  // Fetch exercise variables
  const { data: variables, error: variablesError } = await supabase
    .from('exercise_variables')
    .select('*')
    .eq('exercise_id', exerciseId);

  if (variablesError || !variables) {
    throw new Error('Failed to fetch exercise variables');
  }

  const primary = variables.find(v => v.is_primary);
  const secondary = variables.find(v => v.is_secondary);
  const tertiary = variables.find(v => v.is_tertiary);

  // Handle progression based on type
  switch (exercise.progression_type) {
    case 'single':
      if (primary) {
        await progressVariable(primary);
      }
      break;

    case 'double':
      if (primary) {
        const primaryComplete = await progressVariable(primary);
        if (primaryComplete && secondary) {
          await progressVariable(secondary);
          await resetVariable(primary);
        }
      }
      break;

    case 'triple':
      if (primary) {
        const primaryComplete = await progressVariable(primary);
        if (primaryComplete && secondary) {
          const secondaryComplete = await progressVariable(secondary);
          if (secondaryComplete && tertiary) {
            await progressVariable(tertiary);
            await resetVariable(primary);
            await resetVariable(secondary);
          } else if (secondaryComplete) {
            await resetVariable(primary);
          }
        }
      }
      break;
  }

  // Handle linked exercises
  await progressLinkedExercises(exerciseId);

  // Log completion if session ID is provided
  if (sessionId && sets) {
    await logExerciseCompletion(exerciseId, sessionId, variables, sets);
  }
}

// Toggle maintenance mode
export async function toggleMaintenanceMode(
  exerciseId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .update({ maintenance_mode: enabled })
    .eq('id', exerciseId);

  if (error) {
    throw new Error(`Failed to toggle maintenance mode: ${error.message}`);
  }
}

// Get progression status for UI display
export function getProgressionStatus(variable: ExerciseVariable): {
  current: number;
  total: number;
  nextValue: number;
  isComplete: boolean;
} {
  const { current, total } = getSequencePosition(variable);
  const nextValue = getNextValue(variable);
  const isComplete = isSequenceComplete(variable);

  return {
    current,
    total,
    nextValue,
    isComplete
  };
}