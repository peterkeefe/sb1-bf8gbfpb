import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

export default function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      <View style={styles.trendContainer}>
        {trendUp ? (
          <TrendingUp size={16} color={Colors.success} />
        ) : (
          <TrendingDown size={16} color={Colors.error} />
        )}
        <Text 
          style={[
            styles.trendText, 
            { color: trendUp ? Colors.success : Colors.error }
          ]}
        >
          {trend}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
});