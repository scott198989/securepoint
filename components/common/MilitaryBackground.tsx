// Military Background Component
// Displays a personalized military branch background based on user profile

import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useMilitaryBackground, useTheme } from '../../hooks';

interface MilitaryBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  overlayOpacity?: number; // 0-1, default 0.85 for readability
  showBackground?: boolean; // Allow disabling background
}

export function MilitaryBackground({
  children,
  style,
  overlayOpacity = 0.85,
  showBackground = true,
}: MilitaryBackgroundProps) {
  const { background, hasBackground } = useMilitaryBackground();
  const theme = useTheme();

  // If no background or disabled, just render children with theme background
  if (!showBackground || !hasBackground || !background) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={background}
      style={[styles.container, style]}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.isDark
              ? `rgba(0, 0, 0, ${overlayOpacity})`
              : `rgba(255, 255, 255, ${overlayOpacity})`,
          },
        ]}
      >
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
});
