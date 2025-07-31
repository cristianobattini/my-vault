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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // const migrationFunction = (oldRealm: Realm, newRealm: Realm) => {
  //   if (oldRealm.schemaVersion < 1) { // Increment your schema version
  //     const oldTags = oldRealm.objects<Tag>('Tag');
  //     const newTags = newRealm.objects<Tag>('Tag');

  //     for (let i = 0; i < oldTags.length; i++) {
  //       newTags[i].iconName = 'default-icon'; // Set default value for the new property
  //     }
  //   }
  // };


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
      <RealmProvider schemaVersion={2} schema={[Credential, Tag]}>
        <GestureHandlerRootView>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="credential-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GestureHandlerRootView>
        <StatusBar style="auto" />
      </RealmProvider>
    </ThemeProvider>
  );
}
