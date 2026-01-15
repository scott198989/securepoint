// Pay Setup wizard entry point - shows progress and navigation

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { PAY_SETUP_WIZARD_STEPS } from '../../types';
import { Card, Button } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function PaySetupIndexScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, validateProfileCompleteness, initializeProfile } = usePayProfileStore();

  // Initialize profile if not exists
  React.useEffect(() => {
    if (!payProfile) {
      initializeProfile();
    }
  }, []);

  const completeness = validateProfileCompleteness();

  const stepRoutes: Record<string, string> = {
    service: '/pay-setup/service',
    status: '/pay-setup/status',
    location: '/pay-setup/location',
    family: '/pay-setup/family',
    tax: '/pay-setup/tax',
    deductions: '/pay-setup/deductions',
    special_pays: '/pay-setup/special-pays',
  };

  const handleStepPress = (stepId: string) => {
    const route = stepRoutes[stepId];
    if (route) {
      router.push(route as any);
    }
  };

  const handleStartSetup = () => {
    router.push('/pay-setup/service');
  };

  const handleViewSummary = () => {
    router.push('/pay-setup/summary');
  };

  const isStepComplete = (stepId: string): boolean => {
    return completeness.completedSteps.includes(stepId);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Pay Profile Setup</Text>
        <Text style={styles.headerSubtitle}>
          Set up your pay profile to get accurate pay estimates, track your LES, and more.
        </Text>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${completeness.percentComplete}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completeness.percentComplete}% Complete
          </Text>
        </View>
      </Card>

      {/* Quick Start / Continue */}
      {completeness.percentComplete === 0 ? (
        <Button
          title="Start Setup"
          onPress={handleStartSetup}
          style={styles.actionButton}
        />
      ) : completeness.isComplete ? (
        <Button
          title="View Pay Summary"
          onPress={handleViewSummary}
          style={styles.actionButton}
        />
      ) : (
        <Button
          title="Continue Setup"
          onPress={() => {
            const nextStep = completeness.missingSteps[0];
            if (nextStep) {
              handleStepPress(nextStep);
            }
          }}
          style={styles.actionButton}
        />
      )}

      {/* Steps List */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Setup Steps
      </Text>

      {PAY_SETUP_WIZARD_STEPS.map((step, index) => {
        const complete = isStepComplete(step.id);
        return (
          <TouchableOpacity
            key={step.id}
            style={[
              styles.stepCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: complete ? theme.colors.income : theme.colors.border,
              },
            ]}
            onPress={() => handleStepPress(step.id)}
          >
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepNumber,
                  {
                    backgroundColor: complete ? theme.colors.income : theme.colors.border,
                  },
                ]}
              >
                {complete ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                  {step.description}
                </Text>
              </View>
              {step.isOptional && (
                <View style={[styles.optionalBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.optionalText, { color: theme.colors.textSecondary }]}>
                    Optional
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
          Why set up a pay profile?
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Your pay profile enables accurate pay calculations based on your specific situation.
          This includes your base pay, BAH, BAS, and any special pays you're entitled to.
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
          All data is stored locally on your device. We never share your information.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  stepCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  stepCheckmark: {
    color: '#ffffff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  optionalBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  optionalText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  infoCard: {
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
