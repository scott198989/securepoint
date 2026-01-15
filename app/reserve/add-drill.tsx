/**
 * Add Drill Weekend Screen
 * Modal for adding a new drill weekend to the schedule
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useReserveStore } from '../../store/reserveStore';
import { Card, Button } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { TrainingEventType, MUTACount } from '../../types/reserve';

// ============================================================================
// CONSTANTS
// ============================================================================

const EVENT_TYPES: { type: TrainingEventType; label: string; icon: string }[] = [
  { type: 'regular_drill', label: 'Regular Drill', icon: 'calendar' },
  { type: 'additional_drill', label: 'Additional Drill', icon: 'add-circle' },
  { type: 'annual_training', label: 'Annual Training', icon: 'fitness' },
  { type: 'active_duty', label: 'Active Duty', icon: 'briefcase' },
  { type: 'school', label: 'Military School', icon: 'school' },
  { type: 'funeral_honors', label: 'Funeral Honors', icon: 'flag' },
];

const MUTA_OPTIONS: MUTACount[] = [1, 2, 3, 4, 5, 6, 7, 8];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddDrillScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { currentSchedule, addDrillWeekend, createSchedule } = useReserveStore();

  // Form state
  const [eventType, setEventType] = useState<TrainingEventType>('regular_drill');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mutaCount, setMutaCount] = useState<MUTACount>(4);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    // Validate
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate.trim()) {
      newErrors.endDate = 'End date is required';
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      newErrors.startDate = 'Use format YYYY-MM-DD';
    }
    if (endDate && !dateRegex.test(endDate)) {
      newErrors.endDate = 'Use format YYYY-MM-DD';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create schedule if needed
    let scheduleId = currentSchedule?.id;
    if (!scheduleId) {
      scheduleId = createSchedule(new Date().getFullYear(), 'army');
    }

    // Add drill weekend
    addDrillWeekend(scheduleId, {
      eventType,
      title: title.trim(),
      startDate,
      endDate,
      mutaCount,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      isPaid: false,
    });

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Event Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Event Type
        </Text>
        <View style={styles.eventTypeGrid}>
          {EVENT_TYPES.map(({ type, label, icon }) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.eventTypeOption,
                { borderColor: theme.colors.border },
                eventType === type && {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primary + '10',
                },
              ]}
              onPress={() => setEventType(type)}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={eventType === type ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.eventTypeLabel,
                  { color: eventType === type ? theme.colors.primary : theme.colors.text },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
          Title <Text style={{ color: theme.colors.expense }}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.colors.text,
              borderColor: errors.title ? theme.colors.expense : theme.colors.border,
            },
          ]}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setErrors((e) => ({ ...e, title: '' }));
          }}
          placeholder="e.g., December Drill"
          placeholderTextColor={theme.colors.textTertiary}
        />
        {errors.title && (
          <Text style={[styles.errorText, { color: theme.colors.expense }]}>
            {errors.title}
          </Text>
        )}
      </View>

      {/* Date Inputs */}
      <View style={styles.dateRow}>
        <View style={styles.dateInput}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            Start Date <Text style={{ color: theme.colors.expense }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                borderColor: errors.startDate ? theme.colors.expense : theme.colors.border,
              },
            ]}
            value={startDate}
            onChangeText={(text) => {
              setStartDate(text);
              setErrors((e) => ({ ...e, startDate: '' }));
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.startDate && (
            <Text style={[styles.errorText, { color: theme.colors.expense }]}>
              {errors.startDate}
            </Text>
          )}
        </View>
        <View style={styles.dateInput}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            End Date <Text style={{ color: theme.colors.expense }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                borderColor: errors.endDate ? theme.colors.expense : theme.colors.border,
              },
            ]}
            value={endDate}
            onChangeText={(text) => {
              setEndDate(text);
              setErrors((e) => ({ ...e, endDate: '' }));
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.endDate && (
            <Text style={[styles.errorText, { color: theme.colors.expense }]}>
              {errors.endDate}
            </Text>
          )}
        </View>
      </View>

      {/* MUTA Count */}
      {(eventType === 'regular_drill' || eventType === 'additional_drill') && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            MUTA Count
          </Text>
          <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
            Standard drill weekend = MUTA 4
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Location Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
          Location (Optional)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Fort Bragg, NC"
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>

      {/* Notes Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          title="Save Drill"
          onPress={handleSave}
          style={styles.actionButton}
        />
      </View>
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

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },

  // Event Type Grid
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventTypeOption: {
    width: '30%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventTypeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Input Group
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Date Row
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateInput: {
    flex: 1,
  },

  // MUTA Grid
  mutaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mutaOption: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutaValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
