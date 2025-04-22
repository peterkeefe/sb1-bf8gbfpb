import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Clock, CalendarDays, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutProps {
  workout: {
    id: string;
    name: string;
    exercises: Exercise[];
    lastCompleted?: string | null;
  };
  onDelete: () => void;
}

export default function WorkoutCard({ workout, onDelete }: WorkoutProps) {
  const formattedDate = workout.lastCompleted 
    ? new Date(workout.lastCompleted).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'Never';
  
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{workout.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Trash2 size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.exercises}>
        {workout.exercises.length > 0 ? (
          workout.exercises.map((exercise, index) => (
            <Text 
              key={index} 
              style={styles.exerciseText}
              numberOfLines={1}
            >
              • {exercise.name} ({exercise.sets} × {exercise.reps} @ {exercise.weight} lbs)
            </Text>
          ))
        ) : (
          <Text style={styles.noExercises}>No exercises added yet</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <CalendarDays size={16} color={Colors.text.secondary} />
          <Text style={styles.infoText}>Last: {formattedDate}</Text>
        </View>
        <ChevronRight size={20} color={Colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  deleteButton: {
    padding: 4,
  },
  exercises: {
    marginBottom: 16,
  },
  exerciseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  noExercises: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
});