import { router } from 'expo-router';
import { useEffect } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';

function PirateShipMark() {
  return (
    <View className="h-44 w-44 items-center justify-center">
      <View className="absolute h-36 w-36 rounded-full bg-primary opacity-15" />
      <View className="absolute bottom-5 h-5 w-36 rounded-full bg-primary opacity-20" />
      <Svg height="150" viewBox="0 0 160 150" width="160">
        <Path
          d="M82 20v74"
          stroke={colors.primarySoft}
          strokeLinecap="round"
          strokeWidth="4"
        />
        <Path
          d="M82 25c17 8 29 24 33 48-14-4-25-5-33-2V25Z"
          fill={colors.primarySoft}
          opacity="0.95"
        />
        <Path
          d="M78 38c-18 7-31 23-38 48 15-6 28-8 38-4V38Z"
          fill={colors.primary}
          opacity="0.9"
        />
        <Path
          d="M86 74c12 4 21 13 27 27-11-4-20-5-27-2V74Z"
          fill={colors.primary}
          opacity="0.78"
        />
        <Path
          d="M77 84c-12 4-21 13-28 28 12-5 21-6 28-3V84Z"
          fill={colors.primarySoft}
          opacity="0.78"
        />
        <Path
          d="M82 20c10 0 15 3 22 0v20c-7 3-12 0-22 0V20Z"
          fill={colors.primary}
        />
        <Circle cx="93" cy="31" fill={colors.foreground} r="3" />
        <Path
          d="M88 37c4 4 9 4 13 0"
          stroke={colors.foreground}
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Path
          d="M31 103c30 11 67 12 99 0-4 17-16 29-31 35H62c-15-6-26-18-31-35Z"
          fill={colors.primary}
        />
        <Path
          d="M43 116c22 6 51 7 76 0"
          stroke={colors.background}
          strokeLinecap="round"
          strokeWidth="4"
          opacity="0.35"
        />
        <Path
          d="M47 137h67"
          stroke={colors.primarySoft}
          strokeLinecap="round"
          strokeWidth="5"
        />
      </Svg>
    </View>
  );
}

export default function SplashScreen() {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace('/home');
    }, 900);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Screen centered contentClassName="bg-background px-8">
      <PirateShipMark />

      <Text className="mt-4 text-center text-4xl font-bold text-foreground">
        <Text className="text-4xl font-bold text-foreground">Torrent</Text>
        <Text className="text-4xl font-bold text-primary">Bay</Text>
      </Text>
      <Text className="mt-3 text-center text-base text-muted">
        Search Torrents. Instantly.
      </Text>

      <View className="mt-12 h-1.5 w-40 overflow-hidden rounded-full bg-surfaceElevated">
        <View className="h-full w-2/3 rounded-full bg-primary" />
      </View>
      <Text className="mt-5 text-center text-sm font-medium text-primarySoft">
        Loading...
      </Text>

      <Pressable
        accessibilityLabel="Skip splash and open home"
        accessibilityRole="button"
        className="mt-7 rounded-xl px-3 py-2 opacity-70 active:opacity-100"
        onPress={() => router.replace('/home')}
      >
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
          Skip
        </Text>
      </Pressable>
    </Screen>
  );
}
