/**
 * Transition Setup Screen
 * Initialize transition planning with key details
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { SeparationType, RetirementSystem } from '../../types/transition';

const SEPARATION_TYPES: { type: SeparationType; label: string; icon: string }[] = [
  { type: 'ets', label: 'ETS (End of Service)', icon: 'calendar-outline' },
  { type: 'retirement', label: 'Retirement (20+ years)', icon: 'medal-outline' },
  { type: 'medical_retirement', label: 'Medical Retirement', icon: 'medkit-outline' },
  { type: 'medical_separation', label: 'Medical Separation', icon: 'medical-outline' },
  { type: 'voluntary_separation', label: 'Voluntary Separation', icon: 'hand-right-outline' },
  { type: 'disability_retirement', label: 'Disability Retirement', icon: 'shield-checkmark-outline' },
];

const RETIREMENT_SYSTEMS: { system: RetirementSystem; label: string; desc: string }[] = [
  { system: 'legacy_high3', label: 'High-3', desc: 'Traditional (pre-2018)' },
  { system: 'brs', label: 'BRS', desc: 'Blended Retirement System' },
  { system: 'redux', label: 'REDUX', desc: 'Rare, pre-2000' },
  { system: 'final_pay', label: 'Final Pay', desc: 'Very rare, pre-1980' },
];

type IoniconsName = keyof typeof Ionicons.glyphMap;

export default function TransitionSetupScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { initializeTransition, setTransitionInfo, updateServiceYears, updateRetirementSystem } = useTransitionStore();

  const [step, setStep] = useState(1);
  const [separationType, setSeparationType] = useState<SeparationType>('ets');
  const [retirementSystem, setRetirementSystem] = useState<RetirementSystem>('legacy_high3');
  const [etsDate, setEtsDate] = useState('');
  const [yearsOfService, setYearsOfService] = useState('');
  const [leaveBalance, setLeaveBalance] = useState('');

  const isRetiring = separationType === 'retirement' ||
                     separationType === 'medical_retirement' ||
                     separationType === 'disability_retirement';

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (isRetiring) {
        setStep(3);
      } else {
        handleComplete();
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Initialize transition with gathered data
    initializeTransition(separationType, etsDate);

    // Set additional info
    if (isRetiring) {
      updateRetirementSystem(retirementSystem);
    }

    const years = parseInt(yearsOfService) || 0;
    updateServiceYears(years);

    const leave = parseInt(leaveBalance) || 0;
    setTransitionInfo({ leaveBalance: leave });

    router.replace('/transition' as never);
  };

  const canProceed = () => {
    if (step === 1) {
      return !!separationType;
    }
    if (step === 2) {
      return etsDate.length > 0 && yearsOfService.length > 0;
    }
    return true;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, isRetiring ? 3 : null].filter(Boolean).map((s, i) => (
          <View key={i} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    (s as number) <= step ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              {(s as number) < step && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
            {i < (isRetiring ? 2 : 1) && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor:
                      (s as number) < step ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step 1: Separation Type */}
      {step === 1 && (
        <View>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            What type of separation?
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
            Select the type that best describes your situation
          </Text>

          <View style={styles.optionsGrid}>
            {SEPARATION_TYPES.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor:
                      separationType === option.type
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor:
                      separationType === option.type
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setSeparationType(option.type)}
              >
                <Ionicons
                  name={option.icon as IoniconsName}
                  size={28}
                  color={separationType === option.type ? '#fff' : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color:
                        separationType === option.type
                          ? '#fff'
                          : theme.colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Step 2: Key Dates */}
      {step === 2 && (
        <View>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            Key Details
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
            Enter your separation date and service info
          </Text>

          <Card style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                {isRetiring ? 'Retirement Date' : 'ETS Date'} (YYYY-MM-DD)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={etsDate}
                onChangeText={setEtsDate}
                placeholder="2025-06-01"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Years of Active Service
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={yearsOfService}
                onChangeText={setYearsOfService}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Current Leave Balance (days)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={leaveBalance}
                onChangeText={setLeaveBalance}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Step 3: Retirement System (if retiring) */}
      {step === 3 && isRetiring && (
        <View>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            Retirement System
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
            Select your military retirement system
          </Text>

          <View style={styles.systemsList}>
            {RETIREMENT_SYSTEMS.map((option) => (
              <TouchableOpacity
                key={option.system}
                style={[
                  styles.systemOption,
                  {
                    backgroundColor:
                      retirementSystem === option.system
                        ? theme.colors.primary + '10'
                        : theme.colors.surface,
                    borderColor:
                      retirementSystem === option.system
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setRetirementSystem(option.system)}
              >
                <View style={styles.systemRadio}>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: theme.colors.primary },
                    ]}
                  >
                    {retirementSystem === option.system && (
                      <View
                        style={[styles.radioInner, { backgroundColor: theme.colors.primary }]}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.systemInfo}>
                  <Text style={[styles.systemLabel, { color: theme.colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.systemDesc, { color: theme.colors.textSecondary }]}>
                    {option.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={[styles.infoCard, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {retirementSystem === 'brs'
                ? 'BRS: 2% × years of service. Includes TSP matching up to 5%.'
                : retirementSystem === 'legacy_high3'
                ? 'High-3: 2.5% × years of service. Based on highest 36 months of pay.'
                : 'Contact your finance office to confirm your retirement system.'}
            </Text>
          </Card>
        </View>
      )}

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed()
                ? theme.colors.primary
                : theme.colors.border,
              flex: step === 1 ? 1 : undefined,
            },
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === (isRetiring ? 3 : 2) ? 'Complete Setup' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
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

  // Progress
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    width: 60,
    height: 2,
  },

  // Step content
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },

  // Options grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Input card
  inputCard: {},
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },

  // Systems list
  systemsList: {
    gap: spacing.sm,
  },
  systemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  systemRadio: {
    marginRight: spacing.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  systemInfo: {},
  systemLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  systemDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
