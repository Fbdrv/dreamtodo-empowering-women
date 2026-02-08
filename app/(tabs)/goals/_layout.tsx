import { Stack } from 'expo-router';
import React from 'react';
import { useColors } from '@/providers/ThemeProvider';

export default function GoalsLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
