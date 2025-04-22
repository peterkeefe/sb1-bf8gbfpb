import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  useEffect(() => {
    // Hide the splash screen after a delay
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  // Redirect to the tabs home screen
  return <Redirect href="/(tabs)" />;
}