import { supabase } from '@/lib/supabase';
import { handleExerciseProgression } from '@/utils/progressionLogic';

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface ExerciseSession {
  exerciseId: string;
  currentSet: number;
  totalSets: number;
  completed: boolean;
  sets: SetLog[];
}

export interface SetLog {
  exerciseLogId: string;
  setNumber: number;
  completed: boolean;
  success: boolean;
  painScore?: number;
  difficultyScore?: number;
  notes?: string;
}

// Create a new workout session
export async function createWorkoutSession(
  workoutId: string,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      workout_id: workoutId,
      user_id: userId,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create workout session: ${error.message}`);
  return data.id;
}

// Complete a workout session
export async function completeWorkoutSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to complete workout session: ${error.message}`);
}

// Log a set completion
export async function logSetCompletion(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  success: boolean,
  painScore?: number,
  difficultyScore?: number,
  notes?: string
): Promise<void> {
  // Create exercise log if it doesn't exist
  const { data: exerciseLog, error: exerciseLogError } = await supabase
    .from('exercise_logs')
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId
    })
    .select()
    .single();

  if (exerciseLogError) {
    throw new Error(`Failed to create exercise log: ${exerciseLogError.message}`);
  }

  // Create set log
  const { error: setLogError } = await supabase
    .from('set_logs')
    .insert({
      exercise_log_id: exerciseLog.id,
      set_number: setNumber,
      completed: true,
      success,
      pain_score: painScore,
      difficulty_score: difficultyScore,
      notes
    });

  if (setLogError) {
    throw new Error(`Failed to create set log: ${setLogError.message}`);
  }

  // Handle progression if all sets are complete
  const { data: setLogs, error: setsError } = await supabase
    .from('set_logs')
    .select('*')
    .eq('exercise_log_id', exerciseLog.id);

  if (setsError) {
    throw new Error(`Failed to fetch set logs: ${setsError.message}`);
  }

  const allSetsComplete = setLogs.every(set => set.completed);
  if (allSetsComplete) {
    await handleExerciseProgression(exerciseId, success, sessionId, setLogs);
  }
}

// Get exercise session status
export async function getExerciseSessionStatus(
  sessionId: string,
  exerciseId: string
): Promise<ExerciseSession | null> {
  const { data: exerciseLog, error: logError } = await supabase
    .from('exercise_logs')
    .select(`
      *,
      set_logs (*)
    `)
    .eq('session_id', sessionId)
    .eq('exercise_id', exerciseId)
    .single();

  if (logError) return null;

  if (!exerciseLog) {
    return {
      exerciseId,
      currentSet: 1,
      totalSets: 3, // Default to 3 sets
      completed: false,
      sets: []
    };
  }

  return {
    exerciseId,
    currentSet: exerciseLog.set_logs.length + 1,
    totalSets: 3,
    completed: exerciseLog.set_logs.length === 3,
    sets: exerciseLog.set_logs
  };
}

// Get next exercise in workout
export async function getNextExercise(
  workoutId: string,
  currentExerciseId: string
): Promise<string | null> {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, order_index')
    .eq('workout_id', workoutId)
    .order('order_index');

  if (error) throw new Error(`Failed to fetch exercises: ${error.message}`);

  const currentIndex = exercises.findIndex(e => e.id === currentExerciseId);
  return currentIndex < exercises.length - 1 ? exercises[currentIndex + 1].id : null;
}

// Get previous exercise in workout
export async function getPreviousExercise(
  workoutId: string,
  currentExerciseId: string
): Promise<string | null> {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, order_index')
    .eq('workout_id', workoutId)
    .order('order_index');

  if (error) throw new Error(`Failed to fetch exercises: ${error.message}`);

  const currentIndex = exercises.findIndex(e => e.id === currentExerciseId);
  return currentIndex > 0 ? exercises[currentIndex - 1].id : null;
}