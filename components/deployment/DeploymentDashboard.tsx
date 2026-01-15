/**
 * DeploymentDashboard Component
 * Overview of deployment status, countdown, and key metrics
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card } from '../common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { DeploymentCountdown, DeploymentPhase, DeploymentSummary } from '../../types/deployment';

// ============================================================================
// TYPES
// ============================================================================

interface DeploymentDashboardProps {
  summary: DeploymentSummary;
  countdown: DeploymentCountdown | null;
  onViewDetails?: () => void;
  onViewSavings?: () => void;
  onViewCountdown?: () => void;
  compact?: boolean;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const PhaseIndicator: React.FC<{ phase: DeploymentPhase }> = ({ phase }) => {
  const theme = useTheme();

  const phaseConfig = {
    pre_deployment: { label: 'Pre-Deployment', color: '#f59e0b', icon: 'calendar-outline' as const },
    deployment: { label: 'Deployed', color: '#22c55e', icon: 'airplane' as const },
    redeployment: { label: 'Coming Home', color: '#3b82f6', icon: 'home-outline' as const },
    post_deployment: { label: 'Post-Deployment', color: '#8b5cf6', icon: 'checkmark-circle' as const },
    not_deployed: { label: 'Not Deployed', color: theme.colors.textSecondary, icon: 'remove-circle-outline' as const },
  };

  const config = phaseConfig[phase];

  return (
    <View style={[styles.phaseIndicator, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text style={[styles.phaseText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const CountdownRing: React.FC<{
  percentComplete: number;
  daysRemaining: number;
  size?: 'small' | 'large';
}> = ({ percentComplete, daysRemaining, size = 'large' }) => {
  const theme = useTheme();
  const ringSize = size === 'large' ? 120 : 80;
  const strokeWidth = size === 'large' ? 10 : 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentComplete / 100) * circumference;

  return (
    <View style={[styles.countdownRing, { width: ringSize, height: ringSize }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ringBackground,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            borderColor: theme.colors.surfaceVariant,
          },
        ]}
      />
      {/* Progress indicator (simplified - not SVG) */}
      <View
        style={[
          styles.ringProgress,
          {
            width: ringSize - strokeWidth * 2,
            height: ringSize - strokeWidth * 2,
            borderRadius: (ringSize - strokeWidth * 2) / 2,
            borderWidth: strokeWidth,
            borderColor: theme.colors.primary,
            borderTopColor: 'transparent',
            borderRightColor: percentComplete > 25 ? theme.colors.primary : 'transparent',
            borderBottomColor: percentComplete > 50 ? theme.colors.primary : 'transparent',
            borderLeftColor: percentComplete > 75 ? theme.colors.primary : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      {/* Center content */}
      <View style={styles.ringCenter}>
        <Text style={[styles.daysNumber, { color: theme.colors.text, fontSize: size === 'large' ? 28 : 20 }]}>
          {daysRemaining}
        </Text>
        <Text style={[styles.daysLabel, { color: theme.colors.textSecondary, fontSize: size === 'large' ? 12 : 10 }]}>
          days left
        </Text>
      </View>
    </View>
  );
};

const MetricCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}> = ({ icon, label, value, subtitle, color, onPress }) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;

  const content = (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.metricTouchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DeploymentDashboard: React.FC<DeploymentDashboardProps> = ({
  summary,
  countdown,
  onViewDetails,
  onViewSavings,
  onViewCountdown,
  compact = false,
}) => {
  const theme = useTheme();

  // Format metrics
  const additionalPayFormatted = formatCurrency(summary.additionalMonthlyPay);
  const projectedSavingsFormatted = formatCurrency(summary.projectedSavings);
  const savingsProgressFormatted = `${Math.round(summary.savingsProgress)}%`;

  if (compact) {
    return (
      <TouchableOpacity onPress={onViewDetails}>
        <Card style={[styles.compactCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.compactContent}>
            <View style={styles.compactLeft}>
              <PhaseIndicator phase={summary.phase} />
              <Text style={styles.compactTitle}>Deployment Active</Text>
              <Text style={styles.compactSubtitle}>
                {countdown?.daysRemaining} days remaining
              </Text>
            </View>
            <View style={styles.compactRight}>
              <Text style={styles.compactSavings}>{projectedSavingsFormatted}</Text>
              <Text style={styles.compactSavingsLabel}>Projected Savings</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with phase */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Deployment Status</Text>
          <PhaseIndicator phase={summary.phase} />
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton}>
            <Text style={[styles.detailsButtonText, { color: theme.colors.primary }]}>
              View Details
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Countdown section */}
      {countdown && (
        <TouchableOpacity
          onPress={onViewCountdown}
          style={[styles.countdownSection, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <CountdownRing
            percentComplete={summary.percentComplete}
            daysRemaining={summary.daysRemaining}
          />
          <View style={styles.countdownStats}>
            <View style={styles.countdownStat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {Math.round(summary.percentComplete)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Complete
              </Text>
            </View>
            <View style={styles.countdownStat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {countdown.monthsDeployed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Months In
              </Text>
            </View>
            <View style={styles.countdownStat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {countdown.weekendsRemaining}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Weekends Left
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon="cash-outline"
          label="Extra Monthly Pay"
          value={additionalPayFormatted}
          subtitle="HFP + FSA"
          color={theme.colors.income}
        />
        <MetricCard
          icon="trending-up-outline"
          label="Projected Savings"
          value={projectedSavingsFormatted}
          subtitle="End of deployment"
          color={theme.colors.primary}
          onPress={onViewSavings}
        />
        <MetricCard
          icon="pie-chart-outline"
          label="Savings Progress"
          value={savingsProgressFormatted}
          subtitle="of goal"
          color="#8b5cf6"
          onPress={onViewSavings}
        />
        <MetricCard
          icon="shield-checkmark-outline"
          label="Tax Savings"
          value="CZTE Active"
          subtitle="Tax-free income"
          color="#22c55e"
        />
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Phase indicator
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  phaseText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Countdown section
  countdownSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  countdownRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBackground: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
  },
  daysNumber: {
    fontWeight: typography.fontWeight.bold,
  },
  daysLabel: {
    marginTop: 2,
  },
  countdownStats: {
    flex: 1,
    gap: spacing.md,
  },
  countdownStat: {},
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: 'transparent',
  },
  metricTouchable: {
    flex: 1,
    minWidth: '45%',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  metricSubtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Compact card
  compactCard: {
    padding: spacing.md,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLeft: {
    gap: spacing.xs,
  },
  compactTitle: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  compactSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactSavings: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  compactSavingsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
  },
});

export default DeploymentDashboard;
