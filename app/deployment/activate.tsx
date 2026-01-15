/**
 * Activate Deployment Screen
 * Form to start deployment mode with dates and location
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useDeploymentStore } from '../../store/deploymentStore';
import { Card, Button } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { DeploymentType, DeploymentLocation } from '../../types/deployment';
import { COMBAT_ZONES } from '../../constants/deploymentData';

// ============================================================================
// TYPES
// ============================================================================

type Step = 'type' | 'dates' | 'location' | 'benefits' | 'confirm';

interface DeploymentTypeOption {
  type: DeploymentType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPLOYMENT_TYPES: DeploymentTypeOption[] = [
  {
    type: 'combat',
    label: 'Combat Deployment',
    description: 'Deployment to a designated combat zone',
    icon: 'shield',
  },
  {
    type: 'contingency',
    label: 'Contingency Operation',
    description: 'Support for contingency operations',
    icon: 'flash',
  },
  {
    type: 'peacekeeping',
    label: 'Peacekeeping Mission',
    description: 'UN or NATO peacekeeping operations',
    icon: 'globe',
  },
  {
    type: 'sea_duty',
    label: 'Sea Deployment',
    description: 'Navy/Coast Guard ship deployment',
    icon: 'boat',
  },
  {
    type: 'training',
    label: 'Extended Training',
    description: 'Long-term training deployment',
    icon: 'school',
  },
  {
    type: 'tdy',
    label: 'TDY/Temporary Duty',
    description: 'Temporary duty assignment',
    icon: 'briefcase',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ActivateDeploymentScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { startDeployment } = useDeploymentStore();

  // Form state
  const [step, setStep] = useState<Step>('type');
  const [deploymentType, setDeploymentType] = useState<DeploymentType | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedCombatZone, setSelectedCombatZone] = useState<string | null>(null);
  const [isHazardous, setIsHazardous] = useState(false);
  const [enableHFP, setEnableHFP] = useState(false);
  const [enableFSA, setEnableFSA] = useState(false);
  const [enableCZTE, setEnableCZTE] = useState(false);

  // Validate current step
  const canProceed = (): boolean => {
    switch (step) {
      case 'type':
        return deploymentType !== null;
      case 'dates':
        return departureDate.length > 0 && expectedReturnDate.length > 0;
      case 'location':
        return locationName.length > 0;
      case 'benefits':
        return true;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  // Navigate steps
  const nextStep = () => {
    const steps: Step[] = ['type', 'dates', 'location', 'benefits', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['type', 'dates', 'location', 'benefits', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Submit deployment
  const handleSubmit = () => {
    if (!deploymentType || !departureDate || !expectedReturnDate || !locationName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const combatZone = selectedCombatZone ? COMBAT_ZONES.find(z => z.id === selectedCombatZone) : undefined;

    const location: DeploymentLocation = {
      locationName,
      countryCode: combatZone?.countries[0] || 'XX',
      combatZoneId: selectedCombatZone || undefined,
      isHazardous: isHazardous || !!combatZone?.hfpEligible,
      isRemote: true,
      connectivityLevel: 'limited',
    };

    startDeployment(deploymentType, departureDate, expectedReturnDate, location);

    Alert.alert(
      'Deployment Activated',
      'Your deployment mode is now active. Good luck and stay safe!',
      [{ text: 'OK', onPress: () => router.replace('/deployment' as never) }]
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'type':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              What type of deployment?
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              Select the type that best describes your deployment
            </Text>

            <View style={styles.typeGrid}>
              {DEPLOYMENT_TYPES.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.typeCard,
                    { borderColor: theme.colors.border },
                    deploymentType === option.type && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '10',
                    },
                  ]}
                  onPress={() => setDeploymentType(option.type)}
                >
                  <Ionicons
                    name={option.icon}
                    size={28}
                    color={deploymentType === option.type ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color: deploymentType === option.type ? theme.colors.primary : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={[styles.typeDescription, { color: theme.colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'dates':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Deployment Dates
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              Enter your departure and expected return dates
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Departure Date
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.placeholder}
                value={departureDate}
                onChangeText={setDepartureDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Expected Return Date
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.placeholder}
                value={expectedReturnDate}
                onChangeText={setExpectedReturnDate}
              />
            </View>

            {departureDate && expectedReturnDate && (
              <Card style={[styles.durationCard, { backgroundColor: theme.colors.primary + '10' }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.durationText, { color: theme.colors.primary }]}>
                  Deployment Duration: {Math.ceil(
                    (new Date(expectedReturnDate).getTime() - new Date(departureDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                  )} days
                </Text>
              </Card>
            )}
          </View>
        );

      case 'location':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Deployment Location
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              Where will you be deployed?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Location Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text },
                ]}
                placeholder="e.g., Camp Arifjan, Kuwait"
                placeholderTextColor={theme.colors.placeholder}
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: spacing.md }]}>
              Combat Zone (if applicable)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zonesScroll}>
              <TouchableOpacity
                style={[
                  styles.zoneChip,
                  { borderColor: theme.colors.border },
                  !selectedCombatZone && {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.primary + '10',
                  },
                ]}
                onPress={() => setSelectedCombatZone(null)}
              >
                <Text
                  style={[
                    styles.zoneChipText,
                    { color: !selectedCombatZone ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  Not Combat Zone
                </Text>
              </TouchableOpacity>
              {COMBAT_ZONES.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zoneChip,
                    { borderColor: theme.colors.border },
                    selectedCombatZone === zone.id && {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primary + '10',
                    },
                  ]}
                  onPress={() => setSelectedCombatZone(zone.id)}
                >
                  <Text
                    style={[
                      styles.zoneChipText,
                      { color: selectedCombatZone === zone.id ? theme.colors.primary : theme.colors.text },
                    ]}
                  >
                    {zone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsHazardous(!isHazardous)}
            >
              <Ionicons
                name={isHazardous ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                Hazardous duty location
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'benefits':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Pay Benefits
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              Select the benefits you expect to receive
            </Text>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setEnableHFP(!enableHFP)}
            >
              <Ionicons
                name={enableHFP ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.toggleContent}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Hostile Fire Pay (HFP/IDP)
                </Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  $225/month for service in hazardous areas
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setEnableFSA(!enableFSA)}
            >
              <Ionicons
                name={enableFSA ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.toggleContent}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Family Separation Allowance
                </Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  $250/month after 30 days separation
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setEnableCZTE(!enableCZTE)}
            >
              <Ionicons
                name={enableCZTE ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.toggleContent}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Combat Zone Tax Exclusion
                </Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  Tax-free income while in combat zone
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );

      case 'confirm':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Confirm Deployment
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              Review your deployment details
            </Text>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Type</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {DEPLOYMENT_TYPES.find(t => t.type === deploymentType)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Departure</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{departureDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Return</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{expectedReturnDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Location</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{locationName}</Text>
              </View>
            </Card>

            <Card style={[styles.benefitsCard, { backgroundColor: theme.colors.income + '10' }]}>
              <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
                Expected Benefits
              </Text>
              {enableHFP && (
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
                  <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                    Hostile Fire Pay: $225/mo
                  </Text>
                </View>
              )}
              {enableFSA && (
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
                  <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                    Family Separation: $250/mo
                  </Text>
                </View>
              )}
              {enableCZTE && (
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
                  <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                    Combat Zone Tax Exclusion
                  </Text>
                </View>
              )}
            </Card>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {['type', 'dates', 'location', 'benefits', 'confirm'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  s === step
                    ? theme.colors.primary
                    : ['type', 'dates', 'location', 'benefits', 'confirm'].indexOf(step) > index
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation buttons */}
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: theme.colors.background, paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {step !== 'type' && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={prevStep}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>
        )}

        <Button
          title={step === 'confirm' ? 'Activate Deployment' : 'Continue'}
          onPress={step === 'confirm' ? handleSubmit : nextStep}
          disabled={!canProceed()}
          style={styles.continueButton}
        />
      </View>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  stepContent: {},
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },

  // Type selection
  typeGrid: {
    gap: spacing.sm,
  },
  typeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  typeLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
  },
  typeDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Input groups
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  textInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
  },

  // Duration card
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  durationText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Zone chips
  zonesScroll: {
    marginVertical: spacing.sm,
  },
  zoneChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  zoneChipText: {
    fontSize: typography.fontSize.sm,
  },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  toggleDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Summary
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Benefits
  benefitsCard: {
    marginBottom: spacing.md,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
  },
  continueButton: {
    flex: 1,
  },
});
