import { View, Text, StyleSheet, Animated } from 'react-native';
import { formatTime } from '@/utils/timeUtils';
import Colors from '@/constants/Colors';

interface TimerDisplayProps {
  time: number;
  progress: Animated.Value;
  timerType: 'countdown' | 'stopwatch';
  duration: number;
}

export default function TimerDisplay({ time, progress, timerType, duration }: TimerDisplayProps) {
  // Calculate stroke dash offset for circular progress
  const circumference = 2 * Math.PI * 120; // 120 is radius of circle
  
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  
  // Format the time for display
  const formattedTime = formatTime(time);
  
  // Calculate percentage for progress text
  const percentage = timerType === 'countdown' 
    ? Math.floor(((duration - time) / duration) * 100)
    : Math.floor((time / duration) * 100);
  
  return (
    <View style={styles.container}>
      <Animated.View style={styles.progressContainer}>
        <View style={styles.backgroundCircle} />
        <Animated.View
          style={[
            styles.progressCircle,
            {
              strokeDashoffset,
            },
          ]}
        >
          <View style={styles.progressCircleInner}>
            <View style={styles.circleBackground} />
          </View>
        </Animated.View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Text style={styles.percentText}>
            {timerType === 'countdown' ? 'Remaining' : 'Elapsed'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.background.secondary,
    borderWidth: 10,
    borderColor: `${Colors.secondary}30`,
  },
  progressCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 10,
    borderColor: Colors.primary,
    transform: [{ rotate: '-90deg' }],
  },
  progressCircleInner: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: 'hidden',
  },
  circleBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
  },
  percentText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
});