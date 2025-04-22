import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import WorkoutCard from '@/components/WorkoutCard';

const sampleWorkouts = [
  {
    id: '1',
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 8, weight: 135 },
      { name: 'Pull-ups', sets: 3, reps: 10, weight: 0 },
      { name: 'Shoulder Press', sets: 3, reps: 12, weight: 65 }
    ],
    lastCompleted: '2023-09-15'
  },
  {
    id: '2',
    name: 'Lower Body',
    exercises: [
      { name: 'Squats', sets: 4, reps: 10, weight: 185 },
      { name: 'Deadlifts', sets: 3, reps: 8, weight: 225 },
      { name: 'Lunges', sets: 3, reps: 12, weight: 95 }
    ],
    lastCompleted: '2023-09-18'
  }
];

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState(sampleWorkouts);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  
  const handleAddWorkout = () => {
    if (newWorkoutName.trim() === '') return;
    
    const newWorkout = {
      id: Date.now().toString(),
      name: newWorkoutName,
      exercises: [],
      lastCompleted: null
    };
    
    setWorkouts([...workouts, newWorkout]);
    setNewWorkoutName('');
    setIsAddingWorkout(false);
  };
  
  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };
  
  const renderWorkoutItem = ({ item }) => (
    <WorkoutCard 
      workout={item} 
      onDelete={() => handleDeleteWorkout(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      
      {workouts.length > 0 ? (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.workoutsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubText}>Add your first workout to get started</Text>
        </View>
      )}
      
      {isAddingWorkout ? (
        <View style={styles.addWorkoutContainer}>
          <TextInput
            style={styles.input}
            placeholder="Workout name"
            value={newWorkoutName}
            onChangeText={setNewWorkoutName}
            autoFocus
          />
          <View style={styles.addWorkoutButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => setIsAddingWorkout(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleAddWorkout}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setIsAddingWorkout(true)}
        >
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>New Workout</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: Colors.background.primary,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  workoutsList: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  addWorkoutContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  addWorkoutButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: Colors.background.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});