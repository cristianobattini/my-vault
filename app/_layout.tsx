import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { RealmProvider } from "@realm/react";

import { useColorScheme } from '@/hooks/useColorScheme';
import { Credential } from '@/models/Credential';
import { Tag } from '@/models/Tag';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { PaperProvider } from 'react-native-paper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* const migrationFunction = (oldRealm: Realm, newRealm: Realm) => {
  
  }; */


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RealmProvider schemaVersion={3} schema={[Credential, Tag]}>
        <GestureHandlerRootView>
          <PaperProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="credential-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          </PaperProvider>
        </GestureHandlerRootView>
        <StatusBar style="auto" />
      </RealmProvider>
    </ThemeProvider>
  );
}
