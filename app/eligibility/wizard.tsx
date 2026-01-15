/**
 * Eligibility Wizard Screen
 * Full-screen wizard for special pay eligibility assessment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { EligibilityWizard, EligibilityResults } from '../../components/military/EligibilityWizard';
import { COMPREHENSIVE_WIZARD } from '../../constants/eligibilityRules';
import { EligibilityResult } from '../../types/eligibility';
import { typography, spacing } from '../../constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EligibilityWizardScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const handleComplete = (wizardResult: EligibilityResult) => {
    setResult(wizardResult);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDismiss = () => {
    router.back();
  };

  const handleStartOver = () => {
    setResult(null);
  };

  // Show results if completed
  if (result) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleDismiss} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Your Results
          </Text>
          <View style={styles.headerButton} />
        </View>

        <EligibilityResults
          result={result}
          onDismiss={handleDismiss}
          onStartOver={handleStartOver}
        />
      </View>
    );
  }

  // Show wizard
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Eligibility Assessment
        </Text>
        <View style={styles.headerButton} />
      </View>

      <EligibilityWizard
        steps={COMPREHENSIVE_WIZARD.steps}
        payTypes={COMPREHENSIVE_WIZARD.payTypes}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
