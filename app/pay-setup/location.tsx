// Location step - duty station ZIP and housing type

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
import { HousingType } from '../../types';
import { Button } from '../../components/common';
import { ZipLookup } from '../../components/military';
import { typography, borderRadius, spacing } from '../../constants/theme';

const HOUSING_OPTIONS: { value: HousingType; label: string; description: string }[] = [
  {
    value: 'off_base_bah',
    label: 'Off-Base (BAH)',
    description: 'Living off-base and receiving BAH',
  },
  {
    value: 'barracks',
    label: 'Barracks',
    description: 'Living in on-base barracks (no BAH)',
  },
  {
    value: 'on_base_family',
    label: 'On-Base Housing',
    description: 'Government family housing (no BAH)',
  },
  {
    value: 'privatized_housing',
    label: 'Privatized Housing',
    description: 'Privatized on-base housing (receives BAH)',
  },
  {
    value: 'off_base_oha',
    label: 'Overseas (OHA)',
    description: 'Overseas receiving OHA instead of BAH',
  },
];

export default function LocationStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [zip, setZip] = useState<string>(payProfile?.dutyStationZip || '');
  const [mhaCode, setMhaCode] = useState<string | undefined>(payProfile?.mhaCode);
  const [stationName, setStationName] = useState<string>(payProfile?.dutyStationName || '');
  const [housingType, setHousingType] = useState<HousingType>(
    payProfile?.housingType || 'off_base_bah'
  );
  const [error, setError] = useState<string | undefined>();

  const handleContinue = () => {
    if (!zip || zip.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    updatePayProfile({
      dutyStationZip: zip,
      mhaCode,
      dutyStationName: stationName || undefined,
      housingType,
    });

    router.push('/pay-setup/family');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* ZIP Lookup */}
      <ZipLookup
        value={zip}
        mhaCode={mhaCode}
        stationName={stationName}
        onZipChange={(newZip) => {
          setZip(newZip);
          setError(undefined);
        }}
        onMHAChange={setMhaCode}
        onStationNameChange={setStationName}
        error={error}
      />

      {/* Housing Type */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Housing Situation
        </Text>
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          This affects whether you receive BAH or OHA.
        </Text>

        <View style={styles.housingOptions}>
          {HOUSING_OPTIONS.map((option) => {
            const isSelected = housingType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.housingOption,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary + '15'
                      : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setHousingType(option.value)}
              >
                <View style={styles.optionHeader}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.colors.primary },
                        ]}
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
  section: {
    marginTop: spacing.lg,
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
  housingOptions: {
    gap: spacing.sm,
  },
  housingOption: {
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
  continueButton: {
    marginTop: spacing.xl,
  },
});
