/**
 * Pay Calculator Screen
 * Interactive military pay calculator with what-if scenarios
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { Button, Card } from '../../components/common';
import { PayGradeSelector } from '../../components/military/PayGradeSelector';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { PayGrade } from '../../types';
import { getBasePay, getBASRate, SPECIAL_PAY_RATES } from '../../constants/militaryData/payTables';
import { getBAHRate, findMHAByZip } from '../../constants/militaryData/bahRates';
import {
  estimateTaxes,
  estimateMonthlyWithholding,
  TaxEstimateInput,
} from '../../utils/les/taxEstimator';
import { TaxFilingStatus } from '../../constants/taxBrackets';

// ============================================================================
// TYPES
// ============================================================================

interface CalculatorState {
  payGrade: PayGrade;
  yearsOfService: number;
  zipCode: string;
  hasDependents: boolean;
  filingStatus: TaxFilingStatus;
  stateOfResidence: string;
  // Special pays
  hostileFirePay: boolean;
  familySeparation: boolean;
  flightPay: boolean;
  jumpPay: boolean;
  seaPay: boolean;
  specialDutyPay: boolean;
  // Deductions
  tspPercent: number;
  sgliCoverage: number;
  // Combat zone
  inCombatZone: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PayCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile } = usePayProfileStore();

  // Initialize from profile or defaults
  const [state, setState] = useState<CalculatorState>(() => ({
    payGrade: payProfile?.payGrade || 'E-5',
    yearsOfService: payProfile?.yearsOfService || 4,
    zipCode: payProfile?.dutyStationZip || '23505',
    hasDependents: payProfile?.hasDependents || false,
    filingStatus: (payProfile?.filingStatus as TaxFilingStatus) || 'single',
    stateOfResidence: payProfile?.stateOfResidence || 'VA',
    hostileFirePay: false,
    familySeparation: false,
    flightPay: false,
    jumpPay: false,
    seaPay: false,
    specialDutyPay: false,
    tspPercent: payProfile?.tspTraditionalPercent || 5,
    sgliCoverage: payProfile?.sgliCoverage || 500000,
    inCombatZone: false,
  }));

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update state helper
  const updateState = useCallback((updates: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Calculate pay
  const payEstimate = useMemo(() => {
    const basePay = getBasePay(state.payGrade, state.yearsOfService);
    const bas = getBASRate(state.payGrade);

    // BAH lookup
    const mha = findMHAByZip(state.zipCode);
    const bah = mha ? getBAHRate(mha, state.payGrade, state.hasDependents) || 0 : 0;

    // Special pays
    let specialPays = 0;
    if (state.hostileFirePay) specialPays += SPECIAL_PAY_RATES.hostileFirePay;
    if (state.familySeparation) specialPays += SPECIAL_PAY_RATES.familySeparationAllowance;
    if (state.flightPay) specialPays += state.payGrade.startsWith('E') ? 150 : 206;
    if (state.jumpPay) specialPays += SPECIAL_PAY_RATES.jumpPay;
    if (state.seaPay) specialPays += 100; // Simplified
    if (state.specialDutyPay) specialPays += SPECIAL_PAY_RATES.specialDutyAssignmentPay.sd3;

    const grossPay = basePay + bas + bah + specialPays;

    // Tax estimate
    const taxInput: TaxEstimateInput = {
      taxableIncome: {
        basePay,
        specialPays: state.inCombatZone ? 0 : specialPays,
        bonuses: 0,
        otherTaxable: 0,
      },
      taxFreeIncome: {
        bah,
        bas,
        combatPay: state.inCombatZone ? specialPays : 0,
        otherTaxFree: 0,
      },
      filingStatus: state.filingStatus,
      stateOfResidence: state.stateOfResidence,
      inCombatZone: state.inCombatZone,
    };

    const taxEstimate = estimateTaxes(taxInput);

    // TSP deduction
    const tspDeduction = basePay * (state.tspPercent / 100);

    // SGLI
    const sgliDeduction = (state.sgliCoverage / 1000) * 0.065 + 1; // + $1 TSGLI

    // Calculate monthly amounts
    const monthlyFederalTax = taxEstimate.federalTaxLiability / 12;
    const monthlyStateTax = taxEstimate.stateTaxLiability / 12;
    const monthlyFICA = taxEstimate.totalFICA / 12;

    const totalDeductions =
      monthlyFederalTax + monthlyStateTax + monthlyFICA + tspDeduction + sgliDeduction;

    const netPay = grossPay - totalDeductions;

    return {
      basePay,
      bas,
      bah,
      specialPays,
      grossPay,
      deductions: {
        federalTax: monthlyFederalTax,
        stateTax: monthlyStateTax,
        fica: monthlyFICA,
        tsp: tspDeduction,
        sgli: sgliDeduction,
        total: totalDeductions,
      },
      netPay,
      taxFree: bah + bas + (state.inCombatZone ? basePay + specialPays : 0),
      effectiveTaxRate: taxEstimate.effectiveFederalRate,
    };
  }, [state]);

  // YOS options
  const yosOptions = Array.from({ length: 31 }, (_, i) => i);

  // TSP options
  const tspOptions = [0, 1, 3, 5, 8, 10, 15, 20, 25, 30, 50];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Header Summary Card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>Estimated Monthly Pay</Text>
          {state.inCombatZone && (
            <View style={styles.combatBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.combatBadgeText}>Combat Zone</Text>
            </View>
          )}
        </View>
        <Text style={styles.summaryAmount}>
          {formatCurrency(payEstimate.netPay)}
        </Text>
        <Text style={styles.summarySubtext}>
          {formatCurrency(payEstimate.grossPay)} gross -{' '}
          {formatCurrency(payEstimate.deductions.total)} deductions
        </Text>
        {payEstimate.taxFree > 0 && (
          <Text style={styles.taxFreeText}>
            {formatCurrency(payEstimate.taxFree)} tax-free
          </Text>
        )}
      </Card>

      {/* Pay Grade Selector */}
      <Card style={styles.section}>
        <PayGradeSelector
          value={state.payGrade}
          onChange={(grade) => updateState({ payGrade: grade })}
          label="Pay Grade"
        />
      </Card>

      {/* Years of Service */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Years of Service
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yosScroll}
        >
          {yosOptions.map((yos) => (
            <TouchableOpacity
              key={yos}
              style={[
                styles.yosButton,
                {
                  backgroundColor:
                    state.yearsOfService === yos
                      ? theme.colors.primary
                      : theme.colors.card,
                  borderColor:
                    state.yearsOfService === yos
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => updateState({ yearsOfService: yos })}
            >
              <Text
                style={[
                  styles.yosText,
                  {
                    color:
                      state.yearsOfService === yos ? '#fff' : theme.colors.text,
                  },
                ]}
              >
                {yos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Location & Dependents */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Location & Dependents
        </Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              Dependents
            </Text>
            <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
              Affects BAH rate
            </Text>
          </View>
          <Switch
            value={state.hasDependents}
            onValueChange={(value) => updateState({ hasDependents: value })}
            trackColor={{ true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.bahInfo}>
          <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.bahText, { color: theme.colors.text }]}>
            BAH ({state.zipCode}): {formatCurrency(payEstimate.bah)}/mo
          </Text>
        </View>
      </Card>

      {/* Special Pays */}
      <Card style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Special Pays
          </Text>
          <Ionicons
            name={showAdvanced ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Combat Zone Toggle (Always Visible) */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              Combat Zone (CZTE)
            </Text>
            <Text style={[styles.toggleSubtext, { color: theme.colors.income }]}>
              All pay tax-free
            </Text>
          </View>
          <Switch
            value={state.inCombatZone}
            onValueChange={(value) =>
              updateState({ inCombatZone: value, hostileFirePay: value })
            }
            trackColor={{ true: theme.colors.income }}
            thumbColor="#fff"
          />
        </View>

        {showAdvanced && (
          <>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Hostile Fire Pay
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  ${SPECIAL_PAY_RATES.hostileFirePay}/mo
                </Text>
              </View>
              <Switch
                value={state.hostileFirePay}
                onValueChange={(value) => updateState({ hostileFirePay: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Family Separation Allowance
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  ${SPECIAL_PAY_RATES.familySeparationAllowance}/mo (30+ days)
                </Text>
              </View>
              <Switch
                value={state.familySeparation}
                onValueChange={(value) => updateState({ familySeparation: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Flight Pay (ACIP)
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  Varies by grade
                </Text>
              </View>
              <Switch
                value={state.flightPay}
                onValueChange={(value) => updateState({ flightPay: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Jump Pay
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  ${SPECIAL_PAY_RATES.jumpPay}/mo
                </Text>
              </View>
              <Switch
                value={state.jumpPay}
                onValueChange={(value) => updateState({ jumpPay: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Sea Pay
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  Varies by grade/YOS
                </Text>
              </View>
              <Switch
                value={state.seaPay}
                onValueChange={(value) => updateState({ seaPay: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Special Duty Pay (SDAP)
                </Text>
                <Text style={[styles.toggleSubtext, { color: theme.colors.textSecondary }]}>
                  ~${SPECIAL_PAY_RATES.specialDutyAssignmentPay.sd3}/mo (SD-3)
                </Text>
              </View>
              <Switch
                value={state.specialDutyPay}
                onValueChange={(value) => updateState({ specialDutyPay: value })}
                trackColor={{ true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </>
        )}
      </Card>

      {/* TSP Contribution */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          TSP Contribution
        </Text>
        <Text style={[styles.tspSubtext, { color: theme.colors.textSecondary }]}>
          {state.tspPercent}% = {formatCurrency(payEstimate.deductions.tsp)}/mo
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tspScroll}
        >
          {tspOptions.map((pct) => (
            <TouchableOpacity
              key={pct}
              style={[
                styles.tspButton,
                {
                  backgroundColor:
                    state.tspPercent === pct
                      ? theme.colors.primary
                      : theme.colors.card,
                  borderColor:
                    state.tspPercent === pct
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => updateState({ tspPercent: pct })}
            >
              <Text
                style={[
                  styles.tspText,
                  { color: state.tspPercent === pct ? '#fff' : theme.colors.text },
                ]}
              >
                {pct}%
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Detailed Breakdown */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Pay Breakdown
        </Text>

        {/* Entitlements */}
        <View style={styles.breakdownSection}>
          <Text style={[styles.breakdownCategory, { color: theme.colors.income }]}>
            ENTITLEMENTS
          </Text>
          <BreakdownRow
            label="Base Pay"
            amount={payEstimate.basePay}
            theme={theme}
          />
          <BreakdownRow
            label="BAH"
            amount={payEstimate.bah}
            theme={theme}
            taxFree
          />
          <BreakdownRow
            label="BAS"
            amount={payEstimate.bas}
            theme={theme}
            taxFree
          />
          {payEstimate.specialPays > 0 && (
            <BreakdownRow
              label="Special Pays"
              amount={payEstimate.specialPays}
              theme={theme}
              taxFree={state.inCombatZone}
            />
          )}
          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Gross Pay
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.income }]}>
              {formatCurrency(payEstimate.grossPay)}
            </Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.breakdownSection}>
          <Text style={[styles.breakdownCategory, { color: theme.colors.expense }]}>
            DEDUCTIONS (EST.)
          </Text>
          <BreakdownRow
            label="Federal Tax"
            amount={payEstimate.deductions.federalTax}
            theme={theme}
            isDeduction
          />
          <BreakdownRow
            label="State Tax"
            amount={payEstimate.deductions.stateTax}
            theme={theme}
            isDeduction
          />
          <BreakdownRow
            label="FICA (SS + Medicare)"
            amount={payEstimate.deductions.fica}
            theme={theme}
            isDeduction
          />
          <BreakdownRow
            label="TSP"
            amount={payEstimate.deductions.tsp}
            theme={theme}
            isDeduction
          />
          <BreakdownRow
            label="SGLI + TSGLI"
            amount={payEstimate.deductions.sgli}
            theme={theme}
            isDeduction
          />
          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total Deductions
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.expense }]}>
              -{formatCurrency(payEstimate.deductions.total)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Net Pay Card */}
      <Card
        style={[
          styles.netPayCard,
          {
            backgroundColor: theme.colors.income + '15',
            borderColor: theme.colors.income,
          },
        ]}
      >
        <View style={styles.netPayRow}>
          <Text style={[styles.netPayLabel, { color: theme.colors.text }]}>
            Estimated Take-Home
          </Text>
          <Text style={[styles.netPayAmount, { color: theme.colors.income }]}>
            {formatCurrency(payEstimate.netPay)}/mo
          </Text>
        </View>
        <View style={styles.netPayRow}>
          <Text style={[styles.netPayLabel, { color: theme.colors.textSecondary }]}>
            Annual
          </Text>
          <Text style={[styles.netPayAnnual, { color: theme.colors.income }]}>
            {formatCurrency(payEstimate.netPay * 12)}/yr
          </Text>
        </View>
        <View style={styles.netPayRow}>
          <Text style={[styles.netPayLabel, { color: theme.colors.textSecondary }]}>
            Per Paycheck (1st/15th)
          </Text>
          <Text style={[styles.netPayAnnual, { color: theme.colors.income }]}>
            ~{formatCurrency(payEstimate.netPay / 2)}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Compare with LES"
          variant="outline"
          onPress={() => router.push('/les' as any)}
          style={styles.actionButton}
        />
        <Button
          title="Save as Profile"
          onPress={() => {
            // Would update pay profile
            router.back();
          }}
          style={styles.actionButton}
        />
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
          Tax estimates use simplified calculations. Actual withholding depends on
          your W-4 elections and may vary. Always verify with your official LES.
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function BreakdownRow({
  label,
  amount,
  theme,
  taxFree = false,
  isDeduction = false,
}: {
  label: string;
  amount: number;
  theme: any;
  taxFree?: boolean;
  isDeduction?: boolean;
}) {
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLeft}>
        <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        {taxFree && (
          <View
            style={[
              styles.taxFreeBadge,
              { backgroundColor: theme.colors.income + '20' },
            ]}
          >
            <Text style={[styles.taxFreeLabel, { color: theme.colors.income }]}>
              TAX-FREE
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.breakdownAmount,
          { color: isDeduction ? theme.colors.expense : theme.colors.text },
        ]}
      >
        {isDeduction ? '-' : ''}
        {formatCurrency(amount)}
      </Text>
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
  content: {
    padding: spacing.md,
  },

  // Summary Card
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
  },
  combatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  combatBadgeText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  summarySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  taxFreeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  // YOS Selector
  yosScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  yosButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  yosText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  toggleSubtext: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // BAH Info
  bahInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bahText: {
    fontSize: typography.fontSize.md,
  },

  // TSP
  tspSubtext: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  tspScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  tspButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  tspText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Breakdown
  breakdownSection: {
    marginBottom: spacing.lg,
  },
  breakdownCategory: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakdownLabel: {
    fontSize: typography.fontSize.md,
  },
  breakdownAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  taxFreeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  taxFreeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
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

  // Net Pay Card
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

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },

  // Disclaimer
  disclaimer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
