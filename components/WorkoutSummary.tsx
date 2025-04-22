import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, TrendingUp, ChartBar as BarChart2, Clock } from 'lucide-react-native';
import { formatVariableValue } from '@/lib/progressionUtils';
import Colors from '@/constants/Colors';

interface VariableProgress {
  name: string;
  previousValue: number;
  newValue: number;
  unit?: string;
  variableType: string;
}

interface WorkoutSummaryProps {
  workoutName: string;
  duration: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  averagePainScore: number;
  averageDifficultyScore: number;
  progressedVariables: VariableProgress[];
  onStartNextWorkout?: () => void;
  onFinish: () => void;
}

export default function WorkoutSummary({
  workoutName,
  duration,
  exerciseCount,
  completedSets,
  totalSets,
  averagePainScore,
  averageDifficultyScore,
  progressedVariables,
  onStartNextWorkout,
  onFinish
}: WorkoutSummaryProps) {
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Workout Complete!</Text>
      <Text style={styles.workoutName}>{workoutName}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statCard}>
          <BarChart2 size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
          <Text style={styles.statLabel}>Sets Completed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceContainer}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Average Pain</Text>
            <Text style={[
              styles.performanceValue,
              { color: averagePainScore > 5 ? Colors.error : Colors.success }
            ]}>
              {averagePainScore.toFixed(1)}/10
            </Text>
          </View>

          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Average Difficulty</Text>
            <Text style={[
              styles.performanceValue,
              { color: averageDifficultyScore > 7 ? Colors.warning : Colors.success }
            ]}>
              {averageDifficultyScore.toFixed(1)}/10
            </Text>
          </View>
        </View>
      </View>

      {progressedVariables.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progression Updates</Text>
          {progressedVariables.map((variable, index) => (
            <View key={index} style={styles.progressionItem}>
              <View style={styles.progressionHeader}>
                <Text style={styles.progressionName}>{variable.name}</Text>
                <TrendingUp size={20} color={Colors.success} />
              </View>
              <View style={styles.progressionValues}>
                <Text style={styles.previousValue}>
                  {formatVariableValue(variable.previousValue, variable)}
                </Text>
                <ChevronRight size={20} color={Colors.text.secondary} />
                <Text style={styles.newValue}>
                  {formatVariableValue(variable.newValue, variable)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {onStartNextWorkout && (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={onStartNextWorkout}
          >
            <Text style={styles.primaryButtonText}>Start Next Workout</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={onFinish}
        >
          <Text style={styles.secondaryButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.primary,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.success,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  progressionItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  progressionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressionName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  progressionValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  newValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.success,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.background.secondary,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});