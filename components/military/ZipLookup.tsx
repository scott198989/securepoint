// ZIP Code Lookup component - for duty station and BAH zone lookup

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks';
import { findMHAByZip, getMHAName } from '../../constants/militaryData/bahRates';
import { typography, borderRadius, spacing } from '../../constants/theme';

interface ZipLookupProps {
  value: string;
  mhaCode?: string;
  stationName?: string;
  onZipChange: (zip: string) => void;
  onMHAChange: (mha: string | undefined) => void;
  onStationNameChange?: (name: string) => void;
  label?: string;
  error?: string;
}

export function ZipLookup({
  value,
  mhaCode,
  stationName,
  onZipChange,
  onMHAChange,
  onStationNameChange,
  label = 'Duty Station ZIP Code',
  error,
}: ZipLookupProps) {
  const theme = useTheme();
  const [isLooking, setIsLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [mhaName, setMhaName] = useState<string | null>(null);

  // Lookup MHA when ZIP changes
  useEffect(() => {
    if (value.length === 5) {
      setIsLooking(true);
      setLookupError(null);

      // Simulate async lookup (in production, might be API call)
      setTimeout(() => {
        const foundMHA = findMHAByZip(value);
        if (foundMHA) {
          onMHAChange(foundMHA);
          const name = getMHAName(foundMHA);
          setMhaName(name || foundMHA);
          setLookupError(null);
        } else {
          onMHAChange(undefined);
          setMhaName(null);
          setLookupError('ZIP code not found in BAH database. BAH rates may not be accurate.');
        }
        setIsLooking(false);
      }, 300);
    } else if (value.length > 0 && value.length < 5) {
      onMHAChange(undefined);
      setMhaName(null);
      setLookupError(null);
    }
  }, [value]);

  const handleZipChange = (text: string) => {
    // Only allow numbers, max 5 digits
    const cleaned = text.replace(/\D/g, '').slice(0, 5);
    onZipChange(cleaned);
  };

  return (
    <View style={styles.container}>
      {/* Station Name (optional) */}
      {onStationNameChange && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Duty Station Name (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={stationName}
            onChangeText={onStationNameChange}
            placeholder="e.g., Fort Bragg, Camp Pendleton"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      )}

      {/* ZIP Code Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <View style={styles.zipRow}>
          <TextInput
            style={[
              styles.zipInput,
              {
                backgroundColor: theme.colors.card,
                borderColor: error || lookupError ? theme.colors.expense : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={value}
            onChangeText={handleZipChange}
            placeholder="12345"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            maxLength={5}
          />
          {isLooking && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.spinner}
            />
          )}
        </View>
      </View>

      {/* MHA Result */}
      {mhaCode && mhaName && !isLooking && (
        <View
          style={[
            styles.mhaResult,
            { backgroundColor: theme.colors.income + '15', borderColor: theme.colors.income },
          ]}
        >
          <Text style={[styles.mhaLabel, { color: theme.colors.textSecondary }]}>
            Military Housing Area (MHA)
          </Text>
          <Text style={[styles.mhaCode, { color: theme.colors.income }]}>
            {mhaCode}
          </Text>
          <Text style={[styles.mhaName, { color: theme.colors.text }]}>
            {mhaName}
          </Text>
        </View>
      )}

      {/* Errors */}
      {lookupError && (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning },
          ]}
        >
          <Text style={[styles.warningText, { color: theme.colors.warning }]}>
            {lookupError}
          </Text>
        </View>
      )}
      {error && (
        <Text style={[styles.error, { color: theme.colors.expense }]}>{error}</Text>
      )}

      {/* Help text */}
      <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
        Enter your duty station ZIP code to look up your BAH rate zone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: typography.fontSize.md,
  },
  zipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zipInput: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  spinner: {
    marginLeft: spacing.sm,
  },
  mhaResult: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  mhaLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  mhaCode: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  mhaName: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  warningBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
  },
  error: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
});
