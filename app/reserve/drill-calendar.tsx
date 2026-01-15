/**
 * Drill Calendar Screen
 * Full calendar view with drill schedule management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useReserveStore } from '../../store/reserveStore';
import { DrillCalendar, DrillList } from '../../components/military/DrillCalendar';
import { typography, borderRadius, spacing } from '../../constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function DrillCalendarScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { currentSchedule } = useReserveStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showPast, setShowPast] = useState(false);

  const drillWeekends = currentSchedule?.drillWeekends || [];

  const handleDrillPress = (drill: any) => {
    // Navigate to drill detail/edit
    // For now, just log it
    console.log('Drill pressed:', drill.id);
  };

  const handleAddDrill = () => {
    router.push('/reserve/add-drill' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* View Toggle */}
      <View style={[styles.toggleContainer, { borderBottomColor: theme.colors.border }]}>
        <View style={[styles.toggleGroup, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'calendar' && { backgroundColor: theme.colors.background },
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={viewMode === 'calendar' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color: viewMode === 'calendar'
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && { backgroundColor: theme.colors.background },
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'list' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color: viewMode === 'list'
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'list' && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowPast(!showPast)}
          >
            <Ionicons
              name={showPast ? 'eye' : 'eye-off'}
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.filterText, { color: theme.colors.textSecondary }]}>
              {showPast ? 'Showing all' : 'Upcoming only'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <DrillCalendar
          drillWeekends={drillWeekends}
          onDrillPress={handleDrillPress}
        />
      ) : (
        <DrillList
          drillWeekends={drillWeekends}
          onDrillPress={handleDrillPress}
          showPast={showPast}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddDrill}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom padding */}
      <View style={{ height: insets.bottom + 80 }} />
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

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: borderRadius.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
