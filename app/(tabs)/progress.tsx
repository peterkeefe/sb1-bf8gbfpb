import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart2, TrendingUp, Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';

type ExerciseProgress = {
  name: string;
  startWeight: number;
  currentWeight: number;
  increase: number;
};

const progressData = {
  totalWorkouts: 28,
  monthlyIncrease: 8,
  averageDuration: 47,
  durationIncrease: 3,
  exerciseProgress: [
    { name: 'Bench Press', startWeight: 60, currentWeight: 85, increase: 41.7 },
    { name: 'Squat', startWeight: 80, currentWeight: 120, increase: 50 },
    { name: 'Deadlift', startWeight: 100, currentWeight: 140, increase: 40 },
  ],
};

export default function ProgressScreen() {
  const renderExerciseProgress = (exercise: ExerciseProgress) => (
    <View key={exercise.name} style={styles.progressCard}>
      <View>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.weightProgress}>
          {exercise.startWeight}kg → {exercise.currentWeight}kg
        </Text>
      </View>
      <View style={styles.increaseContainer}>
        <Text style={styles.increaseText}>+{exercise.increase.toFixed(1)}%</Text>
        <TrendingUp size={16} color={Colors.success} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Progress</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Total Workouts</Text>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{progressData.totalWorkouts}</Text>
            <View style={styles.statFooter}>
              <TrendingUp size={16} color={Colors.success} />
              <Text style={styles.statIncrease}>
                +{progressData.monthlyIncrease} this month
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Avg. Duration</Text>
              <BarChart2 size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{progressData.averageDuration}min</Text>
            <View style={styles.statFooter}>
              <TrendingUp size={16} color={Colors.success} />
              <Text style={styles.statIncrease}>
                +{progressData.durationIncrease}min from last month
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strength Progress</Text>
          <View style={styles.progressContainer}>
            {progressData.exerciseProgress.map(renderExerciseProgress)}
          </View>
        </View>

        <View style={[styles.section, styles.chartSection]}>
          <Text style={styles.sectionTitle}>Monthly Activity</Text>
          <View style={styles.chart}>
            {/* Placeholder for chart - we'll implement this later */}
            <Text style={styles.chartPlaceholder}>Activity Chart Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIncrease: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.success,
    marginLeft: 4,
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
  progressContainer: {
    gap: 16,
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  weightProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  increaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  increaseText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.success,
    marginRight: 4,
  },
  chartSection: {
    marginBottom: 100,
  },
  chart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
});