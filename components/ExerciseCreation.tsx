import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ProgressionType, Variable, ProgressionRules } from '@/types/progression';
import { progressionRules, validateVariable } from '@/lib/progressionUtils';
import Colors from '@/constants/Colors';

interface ExerciseCreationProps {
  onSave: (exercise: {
    name: string;
    progressionType: ProgressionType;
    variables: Partial<Variable>[];
    prepTimerDuration: number;
  }) => void;
}

export default function ExerciseCreation({ onSave }: ExerciseCreationProps) {
  const [name, setName] = useState('');
  const [progressionType, setProgressionType] = useState<ProgressionType>('single');
  const [variables, setVariables] = useState<Partial<Variable>[]>([]);
  const [prepTimerDuration, setPrepTimerDuration] = useState(3);
  const [errors, setErrors] = useState<string[]>([]);

  const addVariable = (role: 'primary' | 'secondary' | 'tertiary') => {
    const newVariable: Partial<Variable> = {
      variableType: role === 'primary' ? 'time' : '',
      startValue: 0,
      numberOfIncrements: 5,
      isPrimary: role === 'primary',
      isSecondary: role === 'secondary',
      isTertiary: role === 'tertiary',
    };

    const validationErrors = validateVariable(newVariable, progressionType, variables);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setVariables([...variables, newVariable]);
    setErrors([]);
  };

  const updateVariable = (index: number, updates: Partial<Variable>) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    
    const validationErrors = validateVariable(updatedVariables[index], progressionType, 
      updatedVariables.filter((_, i) => i !== index));
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setVariables(updatedVariables);
    setErrors([]);
  };

  const handleSave = () => {
    if (!name) {
      setErrors(['Exercise name is required']);
      return;
    }

    const rules = progressionRules[progressionType];
    if (variables.length < rules.maxVariables) {
      setErrors([`${progressionType} progression requires ${rules.maxVariables} variables`]);
      return;
    }

    onSave({
      name,
      progressionType,
      variables,
      prepTimerDuration
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Exercise</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exercise Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter exercise name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Progression Type</Text>
        <View style={styles.progressionButtons}>
          {(['single', 'double', 'triple'] as ProgressionType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.progressionButton,
                progressionType === type && styles.progressionButtonActive
              ]}
              onPress={() => setProgressionType(type)}
            >
              <Text style={[
                styles.progressionButtonText,
                progressionType === type && styles.progressionButtonTextActive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Prep Timer (seconds)</Text>
        <TextInput
          style={styles.input}
          value={prepTimerDuration.toString()}
          onChangeText={(value) => setPrepTimerDuration(parseInt(value) || 0)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.variablesSection}>
        <Text style={styles.sectionTitle}>Variables</Text>
        {variables.map((variable, index) => (
          <View key={index} style={styles.variableCard}>
            <Text style={styles.variableRole}>
              {variable.isPrimary ? 'Primary' : 
               variable.isSecondary ? 'Secondary' : 'Tertiary'}
            </Text>
            
            {!variable.isPrimary && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Variable Type</Text>
                <TextInput
                  style={styles.input}
                  value={variable.variableType}
                  onChangeText={(value) => updateVariable(index, { variableType: value })}
                  placeholder="e.g., reps, weight"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Value</Text>
              <TextInput
                style={styles.input}
                value={variable.startValue?.toString()}
                onChangeText={(value) => updateVariable(index, { startValue: parseFloat(value) || 0 })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Increment Size</Text>
                <TextInput
                  style={styles.input}
                  value={variable.incrementSize?.toString()}
                  onChangeText={(value) => updateVariable(index, { incrementSize: parseFloat(value) || 0 })}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>% Increase</Text>
                <TextInput
                  style={styles.input}
                  value={variable.percentageIncrease?.toString()}
                  onChangeText={(value) => updateVariable(index, { percentageIncrease: parseFloat(value) || 0 })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Min Value</Text>
                <TextInput
                  style={styles.input}
                  value={variable.minValue?.toString()}
                  onChangeText={(value) => updateVariable(index, { minValue: parseFloat(value) || 0 })}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Max Value</Text>
                <TextInput
                  style={styles.input}
                  value={variable.maxValue?.toString()}
                  onChangeText={(value) => updateVariable(index, { maxValue: parseFloat(value) || 0 })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        {variables.length < progressionRules[progressionType].maxVariables && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addVariable(
              variables.length === 0 ? 'primary' :
              variables.length === 1 ? 'secondary' : 'tertiary'
            )}
          >
            <Text style={styles.addButtonText}>Add Variable</Text>
          </TouchableOpacity>
        )}
      </View>

      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>{error}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Create Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
  },
  progressionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  progressionButtonActive: {
    backgroundColor: Colors.primary,
  },
  progressionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  progressionButtonTextActive: {
    color: '#fff',
  },
  variablesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  variableCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  variableRole: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}20`,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});