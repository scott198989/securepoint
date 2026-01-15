// Summary step - pay estimate overview

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
import { calculateMilitaryPay } from '../../utils/calculations/militaryPay';
import { getBasePay, getBASRate } from '../../constants/militaryData/payTables';
import { getBAHRate } from '../../constants/militaryData/bahRates';
import { formatCurrency } from '../../utils/formatters';
import { Button, Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function SummaryStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  // Calculate pay estimates
  const basePay = payProfile?.payGrade
    ? getBasePay(payProfile.payGrade, payProfile.yearsOfService || 0)
    : 0;

  const bas = payProfile?.payGrade ? getBASRate(payProfile.payGrade) : 0;

  const bah = payProfile?.mhaCode && payProfile?.payGrade
    ? getBAHRate(payProfile.mhaCode, payProfile.payGrade, payProfile.hasDependents) || 0
    : 0;

  // Special pays total
  const specialPaysTotal = payProfile?.specialPayQualifications
    ?.filter((q) => q.isActive)
    .reduce((sum, q) => sum + q.monthlyAmount, 0) || 0;

  // Gross totals
  const grossMonthly = basePay + bas + bah + specialPaysTotal;
  const grossAnnual = grossMonthly * 12;

  // Estimated deductions
  const tspTraditional = basePay * ((payProfile?.tspTraditionalPercent || 0) / 100);
  const tspRoth = basePay * ((payProfile?.tspRothPercent || 0) / 100);
  const sgliPremium = ((payProfile?.sgliCoverage || 0) / 1000) * 0.065;
  const tsgli = 1; // TSGLI is $1/mo

  // Rough tax estimate (simplified)
  const taxableIncome = basePay + specialPaysTotal; // BAH/BAS are tax-free
  const federalTaxRate = 0.22; // Simplified estimate
  const federalTax = taxableIncome * federalTaxRate;
  const socialSecurity = taxableIncome * 0.062;
  const medicare = taxableIncome * 0.0145;

  const totalDeductions = tspTraditional + tspRoth + sgliPremium + tsgli + federalTax + socialSecurity + medicare;
  const netMonthly = grossMonthly - totalDeductions;
  const netAnnual = netMonthly * 12;

  const handleFinish = () => {
    // Mark profile as complete
    updatePayProfile({ isComplete: true });
    router.replace('/(tabs)/dashboard');
  };

  const handleEditProfile = () => {
    router.push('/pay-setup');
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
        <Text style={styles.headerLabel}>Estimated Monthly Pay</Text>
        <Text style={styles.headerAmount}>{formatCurrency(netMonthly)}</Text>
        <Text style={styles.headerSubtext}>
          Take-home after deductions (estimated)
        </Text>
      </Card>

      {/* Profile Summary */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Profile
        </Text>

        <View style={styles.profileRow}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>
            Grade / YOS
          </Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>
            {payProfile?.payGrade} / {payProfile?.yearsOfService || 0} years
          </Text>
        </View>

        <View style={styles.profileRow}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>
            Duty Status
          </Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>
            {payProfile?.dutyStatus?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>

        <View style={styles.profileRow}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>
            Location
          </Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>
            {payProfile?.dutyStationName || payProfile?.dutyStationZip || 'Not set'}
          </Text>
        </View>

        <View style={styles.profileRow}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>
            Dependents
          </Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>
            {payProfile?.hasDependents ? `Yes (${payProfile.dependentCount})` : 'No'}
          </Text>
        </View>
      </Card>

      {/* Entitlements */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Monthly Entitlements
        </Text>

        <View style={styles.lineItem}>
          <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Base Pay</Text>
          <Text style={[styles.lineAmount, { color: theme.colors.income }]}>
            {formatCurrency(basePay)}
          </Text>
        </View>

        <View style={styles.lineItem}>
          <View style={styles.lineInfo}>
            <Text style={[styles.lineLabel, { color: theme.colors.text }]}>BAH</Text>
            <Text style={[styles.lineTag, { color: theme.colors.income }]}>Tax-Free</Text>
          </View>
          <Text style={[styles.lineAmount, { color: theme.colors.income }]}>
            {formatCurrency(bah)}
          </Text>
        </View>

        <View style={styles.lineItem}>
          <View style={styles.lineInfo}>
            <Text style={[styles.lineLabel, { color: theme.colors.text }]}>BAS</Text>
            <Text style={[styles.lineTag, { color: theme.colors.income }]}>Tax-Free</Text>
          </View>
          <Text style={[styles.lineAmount, { color: theme.colors.income }]}>
            {formatCurrency(bas)}
          </Text>
        </View>

        {payProfile?.specialPayQualifications?.filter((q) => q.isActive).map((q) => (
          <View key={q.payType} style={styles.lineItem}>
            <Text style={[styles.lineLabel, { color: theme.colors.text }]}>
              {q.payType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text style={[styles.lineAmount, { color: theme.colors.income }]}>
              {formatCurrency(q.monthlyAmount)}
            </Text>
          </View>
        ))}

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Gross Pay</Text>
          <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
            {formatCurrency(grossMonthly)}
          </Text>
        </View>
      </Card>

      {/* Deductions */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Estimated Deductions
        </Text>

        <View style={styles.lineItem}>
          <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Federal Tax (est.)</Text>
          <Text style={[styles.lineAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(federalTax)}
          </Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Social Security</Text>
          <Text style={[styles.lineAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(socialSecurity)}
          </Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Medicare</Text>
          <Text style={[styles.lineAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(medicare)}
          </Text>
        </View>

        {(tspTraditional > 0 || tspRoth > 0) && (
          <View style={styles.lineItem}>
            <Text style={[styles.lineLabel, { color: theme.colors.text }]}>
              TSP ({payProfile?.tspTraditionalPercent}% Trad + {payProfile?.tspRothPercent}% Roth)
            </Text>
            <Text style={[styles.lineAmount, { color: theme.colors.expense }]}>
              -{formatCurrency(tspTraditional + tspRoth)}
            </Text>
          </View>
        )}

        <View style={styles.lineItem}>
          <Text style={[styles.lineLabel, { color: theme.colors.text }]}>
            SGLI + TSGLI
          </Text>
          <Text style={[styles.lineAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(sgliPremium + tsgli)}
          </Text>
        </View>

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            Total Deductions
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(totalDeductions)}
          </Text>
        </View>
      </Card>

      {/* Net Pay */}
      <Card style={[styles.netPayCard, { backgroundColor: theme.colors.income + '15', borderColor: theme.colors.income }]}>
        <View style={styles.netPayRow}>
          <Text style={[styles.netPayLabel, { color: theme.colors.text }]}>
            Estimated Take-Home
          </Text>
          <Text style={[styles.netPayAmount, { color: theme.colors.income }]}>
            {formatCurrency(netMonthly)}/mo
          </Text>
        </View>
        <View style={styles.netPayRow}>
          <Text style={[styles.netPayLabel, { color: theme.colors.textSecondary }]}>
            Annual
          </Text>
          <Text style={[styles.netPayAnnual, { color: theme.colors.income }]}>
            {formatCurrency(netAnnual)}/yr
          </Text>
        </View>
      </Card>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
          This is an estimate based on your profile. Actual pay may vary based on
          specific circumstances, tax withholding elections, and other factors.
          Always verify with your LES.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Button
          title="Edit Profile"
          variant="outline"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
        <Button
          title="Done"
          onPress={handleFinish}
          style={styles.doneButton}
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
  headerCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  headerAmount: {
    color: '#ffffff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  profileLabel: {
    fontSize: typography.fontSize.sm,
  },
  profileValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  lineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lineLabel: {
    fontSize: typography.fontSize.md,
  },
  lineTag: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  lineAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  totalAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  netPayCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  netPayLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  netPayAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  netPayAnnual: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  disclaimer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  editButton: {
    flex: 1,
  },
  doneButton: {
    flex: 2,
  },
});
