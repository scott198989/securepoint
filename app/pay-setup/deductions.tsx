// Deductions step - TSP, SGLI, TRICARE

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { Button, Input } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function DeductionsStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [tspTraditional, setTspTraditional] = useState<string>(
    payProfile?.tspTraditionalPercent?.toString() || '5'
  );
  const [tspRoth, setTspRoth] = useState<string>(
    payProfile?.tspRothPercent?.toString() || '0'
  );
  const [sgliCoverage, setSgliCoverage] = useState<string>(
    payProfile?.sgliCoverage?.toString() || '500000'
  );
  const [tricareDental, setTricareDental] = useState<boolean>(
    payProfile?.tricareDental || false
  );

  const getSgliPremium = (coverage: number): number => {
    // SGLI premium is $0.065 per $1,000 of coverage
    return (coverage / 1000) * 0.065;
  };

  const handleContinue = () => {
    const traditional = parseInt(tspTraditional, 10) || 0;
    const roth = parseInt(tspRoth, 10) || 0;
    const coverage = parseInt(sgliCoverage, 10) || 0;

    updatePayProfile({
      tspTraditionalPercent: Math.min(traditional, 100),
      tspRothPercent: Math.min(roth, 100),
      sgliCoverage: Math.min(coverage, 500000),
      tricareDental,
    });

    router.push('/pay-setup/special-pays');
  };

  const handleSkip = () => {
    router.push('/pay-setup/special-pays');
  };

  const sgliAmount = parseInt(sgliCoverage, 10) || 0;
  const sgliPremium = getSgliPremium(sgliAmount);

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
          These deductions are taken from your pay. Setting them here helps calculate
          your actual take-home pay. You can skip this step and update later.
        </Text>
      </View>

      {/* TSP Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Thrift Savings Plan (TSP)
        </Text>

        <View style={styles.tspRow}>
          <View style={styles.tspInput}>
            <Input
              label="Traditional TSP %"
              value={tspTraditional}
              onChangeText={(text) => setTspTraditional(text.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>
          <View style={styles.tspInput}>
            <Input
              label="Roth TSP %"
              value={tspRoth}
              onChangeText={(text) => setTspRoth(text.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          BRS default is 5% to maximize the government match. Combined max is usually
          limited to IRS annual limits (~$22,500 for 2024).
        </Text>
      </View>

      {/* SGLI Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          SGLI Coverage
        </Text>

        <Input
          label="Coverage Amount ($)"
          value={sgliCoverage}
          onChangeText={(text) => setSgliCoverage(text.replace(/\D/g, ''))}
          keyboardType="numeric"
          placeholder="500000"
        />

        <View
          style={[
            styles.premiumBox,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.premiumLabel, { color: theme.colors.textSecondary }]}>
            Estimated Monthly Premium
          </Text>
          <Text style={[styles.premiumAmount, { color: theme.colors.text }]}>
            ${sgliPremium.toFixed(2)}
          </Text>
        </View>

        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Max coverage is $500,000. Premium is $0.065 per $1,000 of coverage.
          TSGLI ($1/mo) is also automatically included.
        </Text>
      </View>

      {/* TRICARE Dental */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              TRICARE Dental (FEDVIP)
            </Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Federal Employees Dental and Vision Insurance Program
            </Text>
          </View>
          <Switch
            value={tricareDental}
            onValueChange={setTricareDental}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={tricareDental ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>

        {tricareDental && (
          <View
            style={[
              styles.premiumBox,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: spacing.sm },
            ]}
          >
            <Text style={[styles.premiumLabel, { color: theme.colors.textSecondary }]}>
              Typical Monthly Premium (varies by plan)
            </Text>
            <Text style={[styles.premiumAmount, { color: theme.colors.text }]}>
              $20 - $75
            </Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Button
          title="Skip"
          variant="outline"
          onPress={handleSkip}
          style={styles.skipButton}
        />
        <Button
          title="Continue"
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  tspRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tspInput: {
    flex: 1,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  premiumBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumLabel: {
    fontSize: typography.fontSize.sm,
  },
  premiumAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});
