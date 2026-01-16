// Military Background Component
// Displays a personalized military branch background based on user profile

import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';
import { useMilitaryBackground, useTheme, useAuth } from '../../hooks';
import { MilitaryBranch, MilitaryStatus } from '../../types';

interface MilitaryBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  overlayOpacity?: number; // 0-1, default 0.4 for visibility while maintaining readability
  showBackground?: boolean; // Allow disabling background
}

// Branch-specific image positioning to ensure emblems display correctly
const getImageStyleForBranch = (branch?: MilitaryBranch, status?: MilitaryStatus): ImageStyle => {
  // Default style - cover to fill screen, centered
  const defaultStyle: ImageStyle = {
    resizeMode: 'cover',
  };

  if (!branch) return defaultStyle;

  // Army - use cover and position to show emblem better
  if (branch === 'army' && status !== 'national_guard' && status !== 'reserve') {
    return {
      resizeMode: 'cover',
    };
  }

  // Air Force - use cover
  if (branch === 'air_force' && status !== 'national_guard' && status !== 'reserve') {
    return {
      resizeMode: 'cover',
    };
  }

  // Army National Guard - scale down slightly
  if (branch === 'army' && status === 'national_guard') {
    return {
      resizeMode: 'cover',
      transform: [{ scale: 0.9 }],
    };
  }

  // Default for all other branches - use cover
  return {
    resizeMode: 'cover',
  };
};

export function MilitaryBackground({
  children,
  style,
  overlayOpacity = 0.4,
  showBackground = true,
}: MilitaryBackgroundProps) {
  const { background, hasBackground } = useMilitaryBackground();
  const { user } = useAuth();
  const theme = useTheme();

  const branch = user?.militaryProfile?.branch;
  const status = user?.militaryProfile?.status;
  const imageStyle = getImageStyleForBranch(branch, status);

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
      imageStyle={imageStyle}
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
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
