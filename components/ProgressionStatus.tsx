import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { getProgressionStatus } from '@/utils/progressionLogic';
import { formatVariableValue } from '@/lib/progressionUtils';
import Colors from '@/constants/Colors';

interface ProgressionStatusProps {
  variable: any;
  showNextValue?: boolean;
}

export default function ProgressionStatus({ variable, showNextValue = true }: ProgressionStatusProps) {
  const status = getProgressionStatus(variable);
  
  return (
    <View style={styles.container}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          Progress: {status.current}/{status.total}
        </Text>
        {showNextValue && !status.isComplete && (
          <View style={styles.nextValue}>
            <TrendingUp size={16} color={Colors.primary} />
            <Text style={styles.nextValueText}>
              Next: {formatVariableValue(status.nextValue, variable)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${(status.current / status.total) * 100}%` }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  nextValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextValueText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});