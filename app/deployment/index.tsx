/**
 * Deployment Hub Screen
 * Main entry point for deployment mode
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useDeploymentStore } from '../../store/deploymentStore';
import { Card } from '../../components/common';
import { DeploymentDashboard } from '../../components/deployment';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

// ============================================================================
// TYPES
// ============================================================================

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  description,
  onPress,
  badge,
  badgeColor,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        {badge && (
          <View style={[styles.menuBadge, { backgroundColor: badgeColor || theme.colors.primary }]}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </Card>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeploymentHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const {
    activeDeployment,
    deploymentBudget,
    savingsTracker,
    getDeploymentSummary,
    getCountdown,
  } = useDeploymentStore();

  const isDeployed = activeDeployment?.isActive === true;
  const summary = getDeploymentSummary();
  const countdown = getCountdown();

  // Render active deployment view
  if (isDeployed && summary) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Deployment Dashboard */}
        <DeploymentDashboard
          summary={summary}
          countdown={countdown}
          onViewDetails={() => router.push('/deployment/status')}
          onViewSavings={() => router.push('/deployment/savings')}
          onViewCountdown={() => router.push('/deployment/countdown')}
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>

          <MenuItem
            icon="trending-up-outline"
            title="Savings Tracker"
            description="Track your deployment savings progress"
            onPress={() => router.push('/deployment/savings')}
            badge={savingsTracker ? `${Math.round(savingsTracker.progressPercent)}%` : undefined}
            badgeColor={theme.colors.income}
          />

          <MenuItem
            icon="wallet-outline"
            title="Deployment Budget"
            description="Manage reduced expenses while deployed"
            onPress={() => router.push('/deployment/budget')}
          />

          <MenuItem
            icon="time-outline"
            title="Countdown"
            description="Track days until return"
            onPress={() => router.push('/deployment/countdown')}
            badge={countdown ? `${countdown.daysRemaining}d` : undefined}
          />

          <MenuItem
            icon="checkbox-outline"
            title="Checklist"
            description="Pre-deployment tasks and reminders"
            onPress={() => router.push('/deployment/checklist')}
          />
        </View>

        {/* End Deployment */}
        <TouchableOpacity
          style={[styles.endButton, { borderColor: theme.colors.expense }]}
          onPress={() => {
            // Would show confirmation dialog
            router.push('/deployment/status');
          }}
        >
          <Ionicons name="stop-circle-outline" size={20} color={theme.colors.expense} />
          <Text style={[styles.endButtonText, { color: theme.colors.expense }]}>
            End Deployment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Render not deployed view
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Hero Section */}
      <Card style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
        <Ionicons name="airplane" size={48} color="#fff" />
        <Text style={styles.heroTitle}>Deployment Mode</Text>
        <Text style={styles.heroSubtitle}>
          Track your finances, maximize savings, and stay connected with family during deployment
        </Text>
        <TouchableOpacity
          style={styles.activateButton}
          onPress={() => router.push('/deployment/activate')}
        >
          <Text style={[styles.activateButtonText, { color: theme.colors.primary }]}>
            Activate Deployment Mode
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Deployment Mode Features
        </Text>

        <Card style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.income + '15' }]}>
            <Ionicons name="trending-up" size={24} color={theme.colors.income} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Savings Accelerator
            </Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
              Track your boosted savings from reduced expenses, HFP/IDP, and tax-free income
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Combat Zone Tax Exclusion
            </Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
              Automatic tracking of tax-free income when deployed to combat zones
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Family Budget
            </Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
              Separate budget tracking for family back home with emergency fund monitoring
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.warning + '15' }]}>
            <Ionicons name="time" size={24} color={theme.colors.warning} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Countdown & Milestones
            </Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
              Visual countdown to return date with savings milestones to celebrate
            </Text>
          </View>
        </Card>
      </View>

      {/* Deployment Benefits Info */}
      <Card style={styles.infoCard}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
          Deployment Pay Benefits
        </Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.benefitText, { color: theme.colors.text }]}>
              Hostile Fire Pay: {formatCurrency(225)}/month
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.benefitText, { color: theme.colors.text }]}>
              Family Separation Allowance: {formatCurrency(250)}/month
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.benefitText, { color: theme.colors.text }]}>
              Combat Zone Tax Exclusion (CZTE)
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.benefitText, { color: theme.colors.text }]}>
              Savings Deposit Program: 10% interest
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },

  // Hero Card
  heroCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  activateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  activateButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  menuDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  menuBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Feature Card
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
  },

  // End Button
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  endButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
