// Special Pays step - toggle special and incentive pays

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { SpecialPayType } from '../../types';
import { Button } from '../../components/common';
import { SpecialPayToggle } from '../../components/military';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function SpecialPaysStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, addSpecialPay, removeSpecialPay } = usePayProfileStore();

  const handleToggle = (payType: SpecialPayType, isActive: boolean, amount?: number) => {
    if (isActive) {
      addSpecialPay({
        payType,
        isEligible: true,
        isActive: true,
        monthlyAmount: amount || 0,
      });
    } else {
      removeSpecialPay(payType);
    }
  };

  const handleContinue = () => {
    router.push('/pay-setup/summary');
  };

  const handleSkip = () => {
    router.push('/pay-setup/summary');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Toggle any special or incentive pays you currently receive. This helps
          calculate your total compensation. Tap each pay for eligibility info.
        </Text>
      </View>

      <SpecialPayToggle
        qualifications={payProfile?.specialPayQualifications || []}
        onToggle={handleToggle}
        onRemove={removeSpecialPay}
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Button
          title="Skip"
          variant="outline"
          onPress={handleSkip}
          style={styles.skipButton}
        />
        <Button
          title="View Summary"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
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
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});
