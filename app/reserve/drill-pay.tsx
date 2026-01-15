/**
 * Drill Pay Calculator Screen
 * Calculate drill pay for Guard/Reserve members
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useReserveStore } from '../../store/reserveStore';
import { usePayProfileStore } from '../../store/payProfileStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { MUTACount } from '../../types/reserve';
import { PayGrade } from '../../types/user';

// ============================================================================
// CONSTANTS
// ============================================================================

const MUTA_OPTIONS: MUTACount[] = [1, 2, 3, 4, 5, 6, 7, 8];

const PAY_GRADES: PayGrade[] = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];

const YOS_OPTIONS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

// ============================================================================
// COMPONENT
// ============================================================================

export default function DrillPayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { calculateDrillPay } = useReserveStore();
  const payProfile = usePayProfileStore((state) => state.payProfile);

  // State
  const [payGrade, setPayGrade] = useState<PayGrade>(payProfile?.payGrade || 'E-4');
  const [yearsOfService, setYearsOfService] = useState(payProfile?.yearsOfService || 4);
  const [mutaCount, setMutaCount] = useState<MUTACount>(4);
  const [includeBAH, setIncludeBAH] = useState(false);
  const [bahAmount, setBahAmount] = useState(1500);

  // Calculate result
  const result = useMemo(() => {
    return calculateDrillPay({
      payGrade,
      yearsOfService,
      mutaCount,
      includeBAH,
      bahAmount,
    });
  }, [payGrade, yearsOfService, mutaCount, includeBAH, bahAmount, calculateDrillPay]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Info Banner */}
      <Card style={[styles.infoBanner, { backgroundColor: theme.colors.info + '15' }]}>
        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
        <Text style={[styles.infoText, { color: theme.colors.info }]}>
          Drill pay is 1/30th of monthly base pay per drill period. Standard weekend = MUTA 4.
        </Text>
      </Card>

      {/* Pay Grade Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Pay Grade
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsRow}
        >
          {PAY_GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.optionChip,
                { borderColor: theme.colors.border },
                payGrade === grade && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPayGrade(grade)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: payGrade === grade ? '#fff' : theme.colors.text },
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Years of Service Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Years of Service
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsRow}
        >
          {YOS_OPTIONS.map((yos) => (
            <TouchableOpacity
              key={yos}
              style={[
                styles.optionChip,
                { borderColor: theme.colors.border },
                yearsOfService === yos && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setYearsOfService(yos)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: yearsOfService === yos ? '#fff' : theme.colors.text },
                ]}
              >
                {yos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MUTA Count Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          MUTA Count
        </Text>
        <View style={styles.mutaGrid}>
          {MUTA_OPTIONS.map((muta) => (
            <TouchableOpacity
              key={muta}
              style={[
                styles.mutaOption,
                { borderColor: theme.colors.border },
                mutaCount === muta && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setMutaCount(muta)}
            >
              <Text
                style={[
                  styles.mutaValue,
                  { color: mutaCount === muta ? '#fff' : theme.colors.text },
                ]}
              >
                {muta}
              </Text>
              <Text
                style={[
                  styles.mutaLabel,
                  { color: mutaCount === muta ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary },
                ]}
              >
                {muta === 4 ? 'Standard' : muta < 4 ? 'Partial' : 'Extended'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BAH Toggle */}
      <Card style={styles.toggleCard}>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setIncludeBAH(!includeBAH)}
        >
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
              Include BAH
            </Text>
            <Text style={[styles.toggleSubtitle, { color: theme.colors.textSecondary }]}>
              Basic Allowance for Housing (if applicable)
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: includeBAH ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                includeBAH && styles.toggleKnobActive,
              ]}
            />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Results */}
      <Card style={[styles.resultCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.resultLabel}>Drill Weekend Pay</Text>
        <Text style={styles.resultValue}>
          {formatCurrency(result.grossPay)}
        </Text>
        <Text style={styles.resultSubtext}>
          Before taxes ({mutaCount} periods)
        </Text>
      </Card>

      {/* Breakdown */}
      <Card style={styles.breakdownCard}>
        <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
          Pay Breakdown
        </Text>
        {result.breakdown.map((item, index) => (
          <View
            key={index}
            style={[styles.breakdownRow, { borderBottomColor: theme.colors.border }]}
          >
            <View style={styles.breakdownLeft}>
              <Text style={[styles.breakdownItem, { color: theme.colors.text }]}>
                {item.item}
              </Text>
              {item.note && (
                <Text style={[styles.breakdownNote, { color: theme.colors.textSecondary }]}>
                  {item.note}
                </Text>
              )}
            </View>
            <Text style={[styles.breakdownAmount, { color: theme.colors.income }]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownItem, { color: theme.colors.textSecondary }]}>
            Est. Taxes (~22%)
          </Text>
          <Text style={[styles.breakdownAmount, { color: theme.colors.expense }]}>
            -{formatCurrency(result.estimatedTaxes)}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownItem, { color: theme.colors.text, fontWeight: '600' }]}>
            Est. Net Pay
          </Text>
          <Text style={[styles.breakdownAmount, { color: theme.colors.text, fontWeight: '600' }]}>
            {formatCurrency(result.estimatedNetPay)}
          </Text>
        </View>
      </Card>

      {/* Annual Projection */}
      <Card style={styles.projectionCard}>
        <Text style={[styles.projectionTitle, { color: theme.colors.text }]}>
          Annual Projection
        </Text>
        <Text style={[styles.projectionSubtitle, { color: theme.colors.textSecondary }]}>
          Based on 48 MUTAs (12 standard weekends)
        </Text>

        <View style={styles.projectionStats}>
          <View style={styles.projectionStat}>
            <Text style={[styles.projectionValue, { color: theme.colors.income }]}>
              {formatCurrency(result.annualProjectedGross)}
            </Text>
            <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
              Gross
            </Text>
          </View>
          <View style={styles.projectionStat}>
            <Text style={[styles.projectionValue, { color: theme.colors.text }]}>
              {formatCurrency(result.annualProjectedNet)}
            </Text>
            <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
              Est. Net
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

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // MUTA Grid
  mutaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mutaOption: {
    width: '23%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  mutaValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  mutaLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Toggle Card
  toggleCard: {
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // Result Card
  resultCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  resultValue: {
    color: '#fff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    marginVertical: spacing.xs,
  },
  resultSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },

  // Breakdown Card
  breakdownCard: {
    marginBottom: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownItem: {
    fontSize: typography.fontSize.md,
  },
  breakdownNote: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  breakdownAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  breakdownDivider: {
    height: spacing.sm,
  },

  // Projection Card
  projectionCard: {
    marginBottom: spacing.md,
  },
  projectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  projectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  projectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  projectionStat: {
    alignItems: 'center',
  },
  projectionValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  projectionLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
