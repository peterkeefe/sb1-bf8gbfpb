import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import WorkoutSession from '@/components/WorkoutSession';
import WorkoutSummary from '@/components/WorkoutSummary';
import { createWorkoutSession, getNextExercise, getPreviousExercise } from '@/lib/workoutSessionUtils';
import { formatVariableValue } from '@/lib/progressionUtils';
import Colors from '@/constants/Colors';

interface ProgressedVariable {
  name: string;
  previousValue: number;
  newValue: number;
  unit?: string;
  variableType: string;
}

export default function WorkoutScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [progressedVariables, setProgressedVariables] = useState<ProgressedVariable[]>([]);

  useEffect(() => {
    initializeWorkoutSession();
  }, []);

  const initializeWorkoutSession = async () => {
    try {
      // For demo, get the first workout
      const { data: workout } = await supabase
        .from('workouts')
        .select('id, name')
        .limit(1)
        .single();

      if (workout) {
        setWorkoutId(workout.id);
        
        // Get first exercise
        const { data: exercise } = await supabase
          .from('exercises')
          .select(`
            *,
            exercise_variables (*)
          `)
          .eq('workout_id', workout.id)
          .order('order_index')
          .limit(1)
          .single();

        if (exercise) {
          // Create session
          const { data: profile } = await supabase.auth.getUser();
          if (profile?.user) {
            const newSessionId = await createWorkoutSession(workout.id, profile.user.id);
            setSessionId(newSessionId);
            setCurrentExercise(exercise);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize workout session:', error);
    }
  };

  const trackVariableProgression = async (exerciseId: string, variableId: string, newValue: number) => {
    // Get previous value from last session
    const { data: lastLog } = await supabase
      .from('exercise_logs')
      .select('value_used, exercise_variables!inner(*)')
      .eq('exercise_id', exerciseId)
      .eq('variable_id', variableId)
      .eq('exercise_variables.id', variableId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastLog && lastLog.value_used !== newValue) {
      const variable = lastLog.exercise_variables;
      setProgressedVariables(prev => [...prev, {
        name: variable.custom_name || variable.variable_type,
        previousValue: lastLog.value_used,
        newValue: newValue,
        unit: variable.unit,
        variableType: variable.variable_type
      }]);
    }
  };

  const handleNext = async () => {
    if (!workoutId || !currentExercise) return;

    const nextExerciseId = await getNextExercise(workoutId, currentExercise.id);
    if (nextExerciseId) {
      const { data: exercise } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_variables (*)
        `)
        .eq('id', nextExerciseId)
        .single();

      if (exercise) {
        // Track progression for current exercise before moving to next
        if (currentExercise.exercise_variables) {
          for (const variable of currentExercise.exercise_variables) {
            await trackVariableProgression(currentExercise.id, variable.id, variable.current_value);
          }
        }
        setCurrentExercise(exercise);
      }
    } else {
      // No more exercises, show summary
      const summary = await generateWorkoutSummary();
      setSummaryData(summary);
      setIsComplete(true);
    }
  };

  const handlePrevious = async () => {
    if (!workoutId || !currentExercise) return;

    const prevExerciseId = await getPreviousExercise(workoutId, currentExercise.id);
    if (prevExerciseId) {
      const { data: exercise } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_variables (*)
        `)
        .eq('id', prevExerciseId)
        .single();

      if (exercise) {
        setCurrentExercise(exercise);
      }
    }
  };

  const generateWorkoutSummary = async () => {
    // Calculate workout statistics
    const { data: logs } = await supabase
      .from('exercise_logs')
      .select(`
        *,
        set_logs (*)
      `)
      .eq('session_id', sessionId);

    if (!logs) return null;

    const totalSets = logs.reduce((acc, log) => acc + log.set_logs.length, 0);
    const completedSets = logs.reduce((acc, log) => 
      acc + log.set_logs.filter(set => set.completed).length, 0);

    const painScores = logs.flatMap(log => 
      log.set_logs
        .filter(set => set.pain_score !== null)
        .map(set => set.pain_score)
    );
    const difficultyScores = logs.flatMap(log => 
      log.set_logs
        .filter(set => set.difficulty_score !== null)
        .map(set => set.difficulty_score)
    );

    const averagePain = painScores.length > 0 
      ? painScores.reduce((a, b) => a + b, 0) / painScores.length 
      : 0;
    const averageDifficulty = difficultyScores.length > 0
      ? difficultyScores.reduce((a, b) => a + b, 0) / difficultyScores.length
      : 0;

    // Get workout duration
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('started_at, completed_at')
      .eq('id', sessionId)
      .single();

    const duration = session 
      ? Math.round((new Date(session.completed_at).getTime() - 
                   new Date(session.started_at).getTime()) / 60000)
      : 0;

    return {
      duration,
      exerciseCount: logs.length,
      completedSets,
      totalSets,
      averagePainScore: averagePain,
      averageDifficultyScore: averageDifficulty,
      progressedVariables
    };
  };

  if (!sessionId || (!currentExercise && !isComplete)) {
    return <View style={styles.container} />;
  }

  if (isComplete && summaryData) {
    return (
      <SafeAreaView style={styles.container}>
        <WorkoutSummary
          workoutName="My Workout" // Replace with actual workout name
          {...summaryData}
          onFinish={() => {
            // Handle workout completion
            setIsComplete(false);
            setSessionId(null);
            setCurrentExercise(null);
            setProgressedVariables([]);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutSession
        sessionId={sessionId}
        exercise={currentExercise}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});