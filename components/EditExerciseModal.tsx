import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { X, Minus, Plus, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatVariableValue } from '@/lib/progressionUtils';
import Colors from '@/constants/Colors';

interface EditExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  exercise: {
    id: string;
    name: string;
    maintenance_mode: boolean;
    variables: any[];
  };
  onUpdate: () => void;
}

export default function EditExerciseModal({
  visible,
  onClose,
  exercise,
  onUpdate
}: EditExerciseModalProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(exercise.maintenance_mode);
  const [variables, setVariables] = useState(exercise.variables);
  const [showGuidance, setShowGuidance] = useState(false);

  const handleVariableUpdate = async (variable: any, newValue: number) => {
    // Validate the new value
    if (variable.min_value != null && newValue < variable.min_value) return;
    if (variable.max_value != null && newValue > variable.max_value) return;

    // Update local state
    setVariables(prev => prev.map(v => 
      v.id === variable.id ? { ...v, current_value: newValue } : v
    ));
  };

  const handleMaintenanceModeToggle = async () => {
    setMaintenanceMode(!maintenanceMode);
  };

  const handleSave = async () => {
    try {
      // Update maintenance mode
      await supabase
        .from('exercises')
        .update({ maintenance_mode: maintenanceMode })
        .eq('id', exercise.id);

      // Update variable values
      for (const variable of variables) {
        await supabase
          .from('exercise_variables')
          .update({ 
            current_value: variable.current_value,
            current_value_modified_at: new Date().toISOString()
          })
          .eq('id', variable.id);
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to save exercise updates:', error);
    }
  };

  const renderGuidance = () => (
    <View style={styles.guidanceContainer}>
      <Text style={styles.guidanceTitle}>Adjustment Guide</Text>
      
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceSubtitle}>Pain Increased:</Text>
        <Text style={styles.guidanceText}>
          • Consider reducing variable values{'\n'}
          • Enable maintenance mode temporarily{'\n'}
          • Focus on form and technique
        </Text>
      </View>

      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceSubtitle}>Exercise Too Difficult:</Text>
        <Text style={styles.guidanceText}>
          • Decrease current values{'\n'}
          • Reduce progression rate{'\n'}
          • Consider maintenance mode
        </Text>
      </View>

      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceSubtitle}>Exercise Too Easy:</Text>
        <Text style={styles.guidanceText}>
          • Increase current values{'\n'}
          • Increase progression rate{'\n'}
          • Ensure maintenance mode is off
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Exercise</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowGuidance(!showGuidance)}
          >
            <AlertCircle size={20} color={Colors.primary} />
            <Text style={styles.helpButtonText}>
              {showGuidance ? 'Hide Guidance' : 'Show Guidance'}
            </Text>
          </TouchableOpacity>

          {showGuidance && renderGuidance()}

          <ScrollView style={styles.scrollContent}>
            <View style={styles.maintenanceSection}>
              <View style={styles.maintenanceHeader}>
                <Text style={styles.maintenanceTitle}>Maintenance Mode</Text>
                <Switch
                  value={maintenanceMode}
                  onValueChange={handleMaintenanceModeToggle}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={styles.maintenanceDescription}>
                When enabled, exercise progression is paused and values remain constant
              </Text>
            </View>

            <View style={styles.variablesSection}>
              <Text style={styles.sectionTitle}>Variables</Text>
              {variables.map((variable, index) => (
                <View key={variable.id} style={styles.variableCard}>
                  <Text style={styles.variableTitle}>
                    {variable.custom_name || variable.variable_type}
                    {variable.is_primary && ' (Primary)'}
                    {variable.is_secondary && ' (Secondary)'}
                    {variable.is_tertiary && ' (Tertiary)'}
                  </Text>

                  <View style={styles.valueControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleVariableUpdate(
                        variable,
                        variable.current_value - (variable.increment_size || 1)
                      )}
                    >
                      <Minus size={20} color={Colors.text.primary} />
                    </TouchableOpacity>

                    <Text style={styles.currentValue}>
                      {formatVariableValue(variable.current_value, variable)}
                    </Text>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleVariableUpdate(
                        variable,
                        variable.current_value + (variable.increment_size || 1)
                      )}
                    >
                      <Plus size={20} color={Colors.text.primary} />
                    </TouchableOpacity>
                  </View>

                  {variable.min_value != null && variable.max_value != null && (
                    <Text style={styles.bounds}>
                      Range: {formatVariableValue(variable.min_value, variable)} - 
                      {formatVariableValue(variable.max_value, variable)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${Colors.primary}10`,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  helpButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  guidanceContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  guidanceTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  guidanceSection: {
    marginBottom: 16,
  },
  guidanceSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  guidanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  scrollContent: {
    maxHeight: '70%',
  },
  maintenanceSection: {
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  maintenanceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  variablesSection: {
    padding: 20,
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
  variableTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  valueControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
  },
  bounds: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
});