import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface ProgressChartProps {
  data: number[];
  labels: string[];
  color: string;
}

export default function ProgressChart({ data, labels, color }: ProgressChartProps) {
  const maxValue = Math.max(...data);
  
  // Calculate heights for bars based on maximum value
  const getBarHeight = (value: number) => {
    return Math.max(5, (value / maxValue) * 150);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barValue}>{value}</Text>
            </View>
            <View 
              style={[
                styles.bar, 
                { 
                  height: getBarHeight(value),
                  backgroundColor: color
                }
              ]} 
            />
            <Text style={styles.barLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 30,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barLabelContainer: {
    marginBottom: 8,
  },
  barValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  bar: {
    width: 25,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  barLabel: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
});