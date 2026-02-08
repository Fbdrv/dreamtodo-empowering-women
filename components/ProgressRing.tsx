import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/colors';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = Colors.primary,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  if (Platform.OS === 'web') {
    const progressPercent = Math.round(Math.min(progress, 1) * 100);
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View
          style={[
            styles.webRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: Colors.borderLight,
            },
          ]}
        />
        <View
          style={[
            styles.webProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: progressPercent > 25 ? color : 'transparent',
              borderBottomColor: progressPercent > 50 ? color : 'transparent',
              borderLeftColor: progressPercent > 75 ? color : 'transparent',
            },
          ]}
        />
        {(label || sublabel) ? (
          <View style={styles.labelContainer}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.borderLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {(label || sublabel) ? (
        <View style={styles.labelContainer}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webRing: {
    position: 'absolute' as const,
  },
  webProgress: {
    position: 'absolute' as const,
    transform: [{ rotate: '-45deg' }],
  },
  labelContainer: {
    position: 'absolute' as const,
    alignItems: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sublabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
