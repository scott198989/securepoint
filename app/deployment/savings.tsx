/**
 * Deployment Savings Screen
 * Track savings progress during deployment
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { useDeploymentStore } from '../../store/deploymentStore';
import { SavingsAccelerator } from '../../components/deployment';
import { spacing } from '../../constants/theme';

export default function DeploymentSavingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const {
    savingsTracker,
    deploymentBudget,
    activeDeployment,
    initializeSavingsTracker,
  } = useDeploymentStore();

  // Initialize tracker if needed
  React.useEffect(() => {
    if (!savingsTracker && activeDeployment) {
      initializeSavingsTracker(10000); // Default $10k goal
    }
  }, [savingsTracker, activeDeployment, initializeSavingsTracker]);

  // Default values if no tracker yet
  const tracker = savingsTracker || {
    deploymentId: '',
    savingsGoal: 10000,
    currentSavings: 0,
    progressPercent: 0,
    monthlySnapshots: [],
    milestones: [],
    projectedEndTotal: 0,
    onTrack: true,
    daysRemaining: 0,
  };

  const projectedMonthlySavings = deploymentBudget?.projectedMonthlySavings || 1500;
  const additionalMonthlyPay = activeDeployment?.payAdjustments.additionalMonthlyPay || 475;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <SavingsAccelerator
        tracker={tracker}
        projectedMonthlySavings={projectedMonthlySavings}
        additionalMonthlyPay={additionalMonthlyPay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
});
