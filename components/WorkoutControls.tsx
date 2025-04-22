import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function WorkoutControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: 'Bench Press',
    sets: 3,
    reps: 10,
    weight: 135
  });
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const updateExerciseProperty = (property: keyof Exercise, value: string | number) => {
    setCurrentExercise({
      ...currentExercise,
      [property]: value
    });
  };
  
  const adjustProperty = (property: 'sets' | 'reps' | 'weight', amount: number) => {
    const newValue = Math.max(0, currentExercise[property] + amount);
    updateExerciseProperty(property, newValue);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerContainer} onPress={toggleExpanded}>
        <Text style={styles.headerText}>Current Exercise</Text>
        {isExpanded ? (
          <ChevronUp size={24} color={Colors.text.primary} />
        ) : (
          <ChevronDown size={24} color={Colors.text.primary} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.exerciseNameContainer}>
            <Text style={styles.label}>Exercise:</Text>
            <TextInput
              style={styles.exerciseNameInput}
              value={currentExercise.name}
              onChangeText={(text) => updateExerciseProperty('name', text)}
              placeholder="Exercise name"
            />
          </View>
          
          <View style={styles.controlRow}>
            <View style={styles.controlItem}>
              <Text style={styles.label}>Sets:</Text>
              <View style={styles.inputWithControls}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => adjustProperty('sets', -1)}
                >
                  <Minus size={16} color={Colors.text.primary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={currentExercise.sets.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text);
                    if (!isNaN(value)) {
                      updateExerciseProperty('sets', value);
                    }
                  }}
                  keyboardType="number-pad"
                />
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => adjustProperty('sets', 1)}
                >
                  <Plus size={16} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.controlItem}>
              <Text style={styles.label}>Reps:</Text>
              <View style={styles.inputWithControls}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => adjustProperty('reps', -1)}
                >
                  <Minus size={16} color={Colors.text.primary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={currentExercise.reps.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text);
                    if (!isNaN(value)) {
                      updateExerciseProperty('reps', value);
                    }
                  }}
                  keyboardType="number-pad"
                />
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => adjustProperty('reps', 1)}
                >
                  <Plus size={16} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.weightContainer}>
            <Text style={styles.label}>Weight (lbs):</Text>
            <View style={styles.inputWithControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => adjustProperty('weight', -5)}
              >
                <Minus size={16} color={Colors.text.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.numberInput}
                value={currentExercise.weight.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text);
                  if (!isNaN(value)) {
                    updateExerciseProperty('weight', value);
                  }
                }}
                keyboardType="number-pad"
              />
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => adjustProperty('weight', 5)}
              >
                <Plus size={16} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: isExpanded => isExpanded ? 1 : 0,
    borderBottomColor: Colors.border,
  },
  headerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.primary,
  },
  expandedContent: {
    padding: 16,
  },
  exerciseNameContainer: {
    marginBottom: 16,
  },
  exerciseNameInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlItem: {
    width: '48%',
  },
  weightContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputWithControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberInput: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});