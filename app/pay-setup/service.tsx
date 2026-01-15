// Service Information step - branch, pay grade, years of service

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
import { MilitaryBranch, PayGrade } from '../../types';
import { Button, Input } from '../../components/common';
import { PayGradeSelector } from '../../components/military';
import { typography, borderRadius, spacing } from '../../constants/theme';

const BRANCHES: { value: MilitaryBranch; label: string }[] = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air_force', label: 'Air Force' },
  { value: 'marine_corps', label: 'Marine Corps' },
  { value: 'coast_guard', label: 'Coast Guard' },
  { value: 'space_force', label: 'Space Force' },
];

export default function ServiceStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [branch, setBranch] = useState<MilitaryBranch>(payProfile?.branch || 'army');
  const [payGrade, setPayGrade] = useState<PayGrade | undefined>(payProfile?.payGrade);
  const [yearsOfService, setYearsOfService] = useState<string>(
    payProfile?.yearsOfService?.toString() || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    if (!payGrade) {
      newErrors.payGrade = 'Please select a pay grade';
    }

    const yos = parseInt(yearsOfService, 10);
    if (isNaN(yos) || yos < 0) {
      newErrors.yearsOfService = 'Please enter valid years of service';
    } else if (yos > 40) {
      newErrors.yearsOfService = 'Years of service cannot exceed 40';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updatePayProfile({
      branch,
      payGrade,
      yearsOfService: parseInt(yearsOfService, 10),
    });

    router.push('/pay-setup/status');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Branch Selection */}
      <Text style={[styles.label, { color: theme.colors.text }]}>Branch of Service</Text>
      <View style={styles.branchGrid}>
        {BRANCHES.map((b) => {
          const isSelected = branch === b.value;
          return (
            <TouchableOpacity
              key={b.value}
              style={[
                styles.branchButton,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setBranch(b.value)}
            >
              <Text
                style={[
                  styles.branchText,
                  { color: isSelected ? '#fff' : theme.colors.text },
                ]}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pay Grade */}
      <View style={styles.section}>
        <PayGradeSelector
          value={payGrade}
          onChange={setPayGrade}
          error={errors.payGrade}
        />
      </View>

      {/* Years of Service */}
      <View style={styles.section}>
        <Input
          label="Years of Service"
          value={yearsOfService}
          onChangeText={(text) => {
            setYearsOfService(text.replace(/\D/g, ''));
            setErrors((prev) => ({ ...prev, yearsOfService: '' }));
          }}
          keyboardType="numeric"
          placeholder="e.g., 4"
          error={errors.yearsOfService}
        />
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Enter total years of military service (for pay purposes). Used to look up your base pay.
        </Text>
      </View>

      {/* Continue Button */}
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
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  branchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  branchButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  branchText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
