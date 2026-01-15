// Tax step - filing status and state of residence

import React, { useState } from 'react';
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
import { TaxFilingStatus } from '../../types';
import { Button, Input } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

const FILING_OPTIONS: { value: TaxFilingStatus; label: string; description: string }[] = [
  {
    value: 'single',
    label: 'Single',
    description: 'Unmarried or legally separated',
  },
  {
    value: 'married_filing_jointly',
    label: 'Married Filing Jointly',
    description: 'Married and filing a joint return',
  },
  {
    value: 'married_filing_separately',
    label: 'Married Filing Separately',
    description: 'Married but filing separate returns',
  },
  {
    value: 'head_of_household',
    label: 'Head of Household',
    description: 'Unmarried with qualifying dependent',
  },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];

// States with no income tax or military-friendly tax rules
const TAX_FREE_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'];

export default function TaxStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [filingStatus, setFilingStatus] = useState<TaxFilingStatus>(
    payProfile?.filingStatus || 'single'
  );
  const [stateOfResidence, setStateOfResidence] = useState<string>(
    payProfile?.stateOfResidence || ''
  );
  const [showStateList, setShowStateList] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const selectedState = US_STATES.find((s) => s.code === stateOfResidence);
  const isTaxFreeState = TAX_FREE_STATES.includes(stateOfResidence);

  const handleContinue = () => {
    if (!stateOfResidence) {
      setError('Please select your state of residence');
      return;
    }

    updatePayProfile({
      filingStatus,
      stateOfResidence,
      stateTaxExempt: isTaxFreeState,
    });

    router.push('/pay-setup/deductions');
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
          Tax information is used to estimate your take-home pay. This is not tax advice.
        </Text>
      </View>

      {/* Filing Status */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Tax Filing Status
        </Text>
        <View style={styles.filingOptions}>
          {FILING_OPTIONS.map((option) => {
            const isSelected = filingStatus === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filingOption,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary + '15'
                      : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setFilingStatus(option.value)}
              >
                <View style={styles.optionHeader}>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: isSelected ? theme.colors.primary : theme.colors.border },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[styles.radioInner, { backgroundColor: theme.colors.primary }]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? theme.colors.primary : theme.colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* State of Residence */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          State of Legal Residence
        </Text>
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Your SLR (State of Legal Residence) for tax withholding purposes.
        </Text>

        <TouchableOpacity
          style={[
            styles.stateSelector,
            {
              backgroundColor: theme.colors.card,
              borderColor: error ? theme.colors.expense : theme.colors.border,
            },
          ]}
          onPress={() => setShowStateList(!showStateList)}
        >
          <Text
            style={[
              styles.stateSelectorText,
              { color: selectedState ? theme.colors.text : theme.colors.placeholder },
            ]}
          >
            {selectedState ? `${selectedState.name} (${selectedState.code})` : 'Select a state'}
          </Text>
          <Text style={{ color: theme.colors.textSecondary }}>
            {showStateList ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showStateList && (
          <View
            style={[
              styles.stateList,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            {US_STATES.map((state) => {
              const isSelected = stateOfResidence === state.code;
              const isTaxFree = TAX_FREE_STATES.includes(state.code);
              return (
                <TouchableOpacity
                  key={state.code}
                  style={[
                    styles.stateItem,
                    isSelected && { backgroundColor: theme.colors.primary + '15' },
                  ]}
                  onPress={() => {
                    setStateOfResidence(state.code);
                    setShowStateList(false);
                    setError(undefined);
                  }}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      { color: isSelected ? theme.colors.primary : theme.colors.text },
                    ]}
                  >
                    {state.name} ({state.code})
                  </Text>
                  {isTaxFree && (
                    <Text style={[styles.taxFreeBadge, { color: theme.colors.income }]}>
                      No Income Tax
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {error && (
          <Text style={[styles.error, { color: theme.colors.expense }]}>{error}</Text>
        )}

        {isTaxFreeState && stateOfResidence && (
          <View
            style={[
              styles.taxFreeBox,
              { backgroundColor: theme.colors.income + '15', borderColor: theme.colors.income },
            ]}
          >
            <Text style={[styles.taxFreeText, { color: theme.colors.income }]}>
              {selectedState?.name} has no state income tax on military pay.
            </Text>
          </View>
        )}
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        style={styles.continueButton}
      />
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
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  filingOptions: {
    gap: spacing.sm,
  },
  filingOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  optionDesc: {
    fontSize: typography.fontSize.sm,
    marginLeft: 28,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  stateSelectorText: {
    fontSize: typography.fontSize.md,
  },
  stateList: {
    maxHeight: 300,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stateItemText: {
    fontSize: typography.fontSize.sm,
  },
  taxFreeBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  error: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  taxFreeBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  taxFreeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
