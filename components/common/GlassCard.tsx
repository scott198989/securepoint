/**
 * GlassCard Component
 * Glassmorphism-styled card with frosted glass effect
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks';
import { borderRadius, spacing } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number; // Blur intensity (0-100)
  tint?: 'light' | 'dark' | 'default';
  noPadding?: boolean;
  borderColor?: string;
}

export function GlassCard({
  children,
  style,
  intensity = 50,
  tint,
  noPadding = false,
  borderColor,
}: GlassCardProps) {
  const theme = useTheme();

  // Determine tint based on theme if not specified
  const blurTint = tint || (theme.isDark ? 'dark' : 'light');

  // Fallback for platforms that don't support blur well
  const useFallback = Platform.OS === 'android';

  if (useFallback) {
    // Android fallback - semi-transparent background
    return (
      <View
        style={[
          styles.card,
          styles.fallbackCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 30, 40, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            borderColor: borderColor || (theme.isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'),
          },
          !noPadding && styles.padding,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.cardWrapper, style]}>
      <BlurView
        intensity={intensity}
        tint={blurTint}
        style={[
          styles.card,
          styles.blurCard,
          {
            borderColor: borderColor || (theme.isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(255, 255, 255, 0.5)'),
          },
        ]}
      >
        <View
          style={[
            styles.innerContent,
            {
              backgroundColor: theme.isDark
                ? 'rgba(30, 30, 40, 0.3)'
                : 'rgba(255, 255, 255, 0.3)',
            },
            !noPadding && styles.padding,
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  blurCard: {
    borderWidth: 1,
  },
  fallbackCard: {
    borderWidth: 1,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  innerContent: {
    flex: 1,
  },
  padding: {
    padding: spacing.md,
  },
});

export default GlassCard;
