import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react-native';
import TimerDisplay from '@/components/TimerDisplay';
import { formatTime } from '@/utils/timeUtils';
import WorkoutControls from '@/components/WorkoutControls';
import Colors from '@/constants/Colors';

const initialTimerDuration = 60; // 60 seconds default

export default function TimerScreen() {
  const [timerDuration, setTimerDuration] = useState(initialTimerDuration);
  const [timeRemaining, setTimeRemaining] = useState(initialTimerDuration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerType, setTimerType] = useState('countdown'); // countdown or stopwatch
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Update animation when the timer changes
  useEffect(() => {
    if (isActive && !isPaused) {
      let animationValue = timerType === 'countdown' 
        ? (timerDuration - timeRemaining) / timerDuration 
        : timeRemaining / timerDuration;
      
      Animated.timing(progressAnimation, {
        toValue: animationValue,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, isActive, isPaused]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (timerType === 'countdown' && prevTime <= 1) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          return timerType === 'countdown' ? prevTime - 1 : prevTime + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, timerType]);
  
  // Handle timer actions
  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(timerDuration);
    progressAnimation.setValue(0);
  };
  
  const adjustTime = (amount) => {
    if (!isActive) {
      const newDuration = Math.max(0, timerDuration + amount);
      setTimerDuration(newDuration);
      setTimeRemaining(newDuration);
    }
  };
  
  const toggleTimerType = () => {
    setTimerType(prevType => {
      const newType = prevType === 'countdown' ? 'stopwatch' : 'countdown';
      resetTimer();
      return newType;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>PrEW Timer</Text>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timerTypeText}>
          {timerType === 'countdown' ? 'Countdown Timer' : 'Stopwatch'}
        </Text>
        
        <TimerDisplay 
          time={timeRemaining}
          progress={progressAnimation}
          timerType={timerType}
          duration={timerDuration}
        />
        
        <View style={styles.adjustButtonsContainer}>
          <TouchableOpacity 
            style={styles.adjustButton} 
            onPress={() => adjustTime(-5)}
            disabled={isActive}
          >
            <Minus size={24} color={!isActive ? Colors.text.primary : Colors.text.disabled} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => adjustTime(5)}
            disabled={isActive}
          >
            <Plus size={24} color={!isActive ? Colors.text.primary : Colors.text.disabled} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <RotateCcw size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.startButton} onPress={toggleTimer}>
          {isActive && !isPaused ? (
            <Pause size={30} color="#fff" />
          ) : (
            <Play size={30} color="#fff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.typeButton} onPress={toggleTimerType}>
          <Text style={styles.typeButtonText}>
            {timerType === 'countdown' ? 'Switch to Stopwatch' : 'Switch to Countdown'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <WorkoutControls />
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  adjustButtonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  typeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
});