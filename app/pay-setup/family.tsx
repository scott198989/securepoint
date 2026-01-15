// Family step - marital status, dependents

import React, { useState } from 'react';
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
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { Button, Input } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

const MARITAL_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function FamilyStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    payProfile?.maritalStatus || 'single'
  );
  const [hasDependents, setHasDependents] = useState<boolean>(
    payProfile?.hasDependents || false
  );
  const [dependentCount, setDependentCount] = useState<string>(
    payProfile?.dependentCount?.toString() || '0'
  );

  const handleContinue = () => {
    const count = parseInt(dependentCount, 10) || 0;

    updatePayProfile({
      maritalStatus,
      hasDependents: hasDependents || count > 0,
      dependentCount: count,
    });

    router.push('/pay-setup/tax');
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
          Your family status affects your BAH rate. Members with dependents receive
          a higher BAH rate than those without.
        </Text>
      </View>

      {/* Marital Status */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Marital Status
        </Text>
        <View style={styles.optionRow}>
          {MARITAL_OPTIONS.map((option) => {
            const isSelected = maritalStatus === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setMaritalStatus(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? '#fff' : theme.colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Dependents Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Do you have dependents?
            </Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Includes spouse, children, or other dependents
            </Text>
          </View>
          <Switch
            value={hasDependents}
            onValueChange={setHasDependents}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={hasDependents ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* Dependent Count */}
      {hasDependents && (
        <View style={styles.section}>
          <Input
            label="Number of Dependents"
            value={dependentCount}
            onChangeText={(text) => setDependentCount(text.replace(/\D/g, ''))}
            keyboardType="numeric"
            placeholder="e.g., 2"
          />
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Include spouse and all children/dependents
          </Text>
        </View>
      )}

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
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
  continueButton: {
    marginTop: spacing.md,
  },
});
