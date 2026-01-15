// Card component for content containers with glassmorphism

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks';
import { borderRadius, typography } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  glass?: boolean; // Enable glassmorphism
}

export function Card({
  children,
  title,
  subtitle,
  onPress,
  style,
  noPadding = false,
  glass = true, // Default to glass effect
}: CardProps) {
  const theme = useTheme();

  const cardContent = (
    <>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </>
  );

  // Glass effect wrapper
  const glassStyle = glass ? {
    backgroundColor: theme.isDark
      ? 'rgba(30, 30, 30, 0.6)'
      : 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: theme.isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)',
  } : {
    backgroundColor: theme.colors.card,
  };

  const content = Platform.OS === 'ios' && glass ? (
    <BlurView
      intensity={40}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[
        styles.card,
        { borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {cardContent}
    </BlurView>
  ) : (
    <View
      style={[
        styles.card,
        glassStyle,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {cardContent}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Stat card variant for dashboard metrics with glassmorphism
interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  color?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  onPress,
  color,
}: StatCardProps) {
  const theme = useTheme();

  // Glassmorphism style
  const glassStyle = {
    backgroundColor: theme.isDark
      ? 'rgba(30, 30, 30, 0.6)'
      : 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: theme.isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)',
  };

  const cardInner = (
    <>
      <View style={styles.statHeader}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: (color || theme.colors.primary) + '20' },
            ]}
          >
            {icon}
          </View>
        )}
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.isPositive
                  ? theme.colors.income + '20'
                  : theme.colors.expense + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                {
                  color: trend.isPositive
                    ? theme.colors.income
                    : theme.colors.expense,
                },
              ]}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.statValue,
          { color: color || theme.colors.text },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </>
  );

  const content = Platform.OS === 'ios' ? (
    <BlurView
      intensity={40}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[
        styles.statCard,
        { borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
      ]}
    >
      {cardInner}
    </BlurView>
  ) : (
    <View style={[styles.statCard, glassStyle]}>
      {cardInner}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.statCardWrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.statCardWrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  // Stat card styles
  statCardWrapper: {
    flex: 1,
    minWidth: '45%',
  },
  statCard: {
    padding: 16,
    borderRadius: borderRadius.lg,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
});
