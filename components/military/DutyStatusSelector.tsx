// Duty Status Selector component - for selecting duty status and component

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks';
import { DutyStatus, MilitaryComponent } from '../../types';
import { typography, borderRadius, spacing } from '../../constants/theme';

interface DutyStatusSelectorProps {
  status?: DutyStatus;
  component?: MilitaryComponent;
  onStatusChange: (status: DutyStatus) => void;
  onComponentChange: (component: MilitaryComponent) => void;
  error?: string;
}

interface StatusOption {
  value: DutyStatus;
  label: string;
  description: string;
  components: MilitaryComponent[];
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'active_duty',
    label: 'Active Duty',
    description: 'Full-time active duty service',
    components: ['active'],
  },
  {
    value: 'guard_drilling',
    label: 'National Guard',
    description: 'Traditional drilling Guard member',
    components: ['guard'],
  },
  {
    value: 'reserve_drilling',
    label: 'Reserve',
    description: 'Traditional drilling Reserve member',
    components: ['reserve'],
  },
  {
    value: 'agr',
    label: 'AGR',
    description: 'Active Guard/Reserve (full-time Guard/Reserve)',
    components: ['guard', 'reserve'],
  },
  {
    value: 'ados',
    label: 'ADOS/ADT',
    description: 'Active Duty Operational Support or Training',
    components: ['guard', 'reserve'],
  },
  {
    value: 'mobilized_title10',
    label: 'Mobilized (Title 10)',
    description: 'Federal mobilization orders',
    components: ['guard', 'reserve'],
  },
  {
    value: 'mobilized_title32',
    label: 'Title 32',
    description: 'State active duty (Guard only)',
    components: ['guard'],
  },
  {
    value: 'deployed',
    label: 'Deployed',
    description: 'Currently deployed (any component)',
    components: ['active', 'guard', 'reserve'],
  },
  {
    value: 'technician',
    label: 'Technician',
    description: 'Federal technician (civilian employee)',
    components: ['guard', 'reserve'],
  },
];

const COMPONENT_LABELS: Record<MilitaryComponent, string> = {
  active: 'Active Component',
  guard: 'National Guard',
  reserve: 'Reserve',
};

export function DutyStatusSelector({
  status,
  component,
  onStatusChange,
  onComponentChange,
  error,
}: DutyStatusSelectorProps) {
  const theme = useTheme();

  const selectedOption = STATUS_OPTIONS.find((opt) => opt.value === status);
  const availableComponents = selectedOption?.components || ['active', 'guard', 'reserve'];

  const handleStatusSelect = (newStatus: DutyStatus) => {
    onStatusChange(newStatus);

    // Auto-select component if only one option
    const option = STATUS_OPTIONS.find((opt) => opt.value === newStatus);
    if (option && option.components.length === 1) {
      onComponentChange(option.components[0]);
    } else if (option && !option.components.includes(component || 'active')) {
      // Reset component if current selection is invalid
      onComponentChange(option.components[0]);
    }
  };

  const renderStatusOption = (option: StatusOption) => {
    const isSelected = status === option.value;
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionCard,
          {
            backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => handleStatusSelect(option.value)}
      >
        <View style={styles.optionHeader}>
          <View
            style={[
              styles.radioOuter,
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
        <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
          {option.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Selection */}
      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
        Duty Status
      </Text>
      <View style={styles.optionsGrid}>
        {STATUS_OPTIONS.map(renderStatusOption)}
      </View>

      {/* Component Selection (if applicable) */}
      {selectedOption && availableComponents.length > 1 && (
        <>
          <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: spacing.lg }]}>
            Component
          </Text>
          <View style={styles.componentRow}>
            {availableComponents.map((comp) => {
              const isSelected = component === comp;
              return (
                <TouchableOpacity
                  key={comp}
                  style={[
                    styles.componentButton,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => onComponentChange(comp)}
                >
                  <Text
                    style={[
                      styles.componentText,
                      { color: isSelected ? '#fff' : theme.colors.text },
                    ]}
                  >
                    {COMPONENT_LABELS[comp]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Error */}
      {error && (
        <Text style={[styles.error, { color: theme.colors.expense }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  optionsGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  radioOuter: {
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
    fontWeight: typography.fontWeight.semibold,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    marginLeft: 28, // Align with label
  },
  componentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  componentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  componentText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  error: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
});
