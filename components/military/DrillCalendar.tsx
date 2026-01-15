/**
 * DrillCalendar Component
 * Calendar view with drill weekend markers and status indicators
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { DrillWeekend, DrillStatus, TrainingEventType } from '../../types/reserve';
import { typography, borderRadius, spacing } from '../../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface DrillCalendarProps {
  drillWeekends: DrillWeekend[];
  onDrillPress?: (drill: DrillWeekend) => void;
  onDatePress?: (date: Date) => void;
  selectedDate?: Date;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  drills: DrillWeekend[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: DrillStatus, theme: ReturnType<typeof useTheme>): string {
  switch (status) {
    case 'completed':
      return theme.colors.income;
    case 'scheduled':
      return theme.colors.primary;
    case 'excused':
      return theme.colors.warning;
    case 'unexcused':
      return theme.colors.expense;
    case 'rescheduled':
      return theme.colors.info;
    case 'cancelled':
      return theme.colors.textTertiary;
    default:
      return theme.colors.textSecondary;
  }
}

function getEventTypeIcon(eventType: TrainingEventType): string {
  switch (eventType) {
    case 'regular_drill':
      return 'calendar';
    case 'additional_drill':
      return 'add-circle';
    case 'annual_training':
      return 'fitness';
    case 'active_duty':
      return 'briefcase';
    case 'school':
      return 'school';
    case 'mobilization':
      return 'airplane';
    case 'funeral_honors':
      return 'flag';
    default:
      return 'ellipse';
  }
}

function getDrillStatus(drill: DrillWeekend): DrillStatus {
  // Determine overall drill status from periods
  const statuses = drill.periods.map(p => p.status);

  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.every(s => s === 'cancelled')) return 'cancelled';
  if (statuses.some(s => s === 'unexcused')) return 'unexcused';
  if (statuses.some(s => s === 'rescheduled')) return 'rescheduled';

  return 'scheduled';
}

function getCalendarDays(year: number, month: number, drillWeekends: DrillWeekend[]): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();

  // Add days from previous month
  const prevMonth = new Date(year, month, 0);
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      drills: getDrillsForDate(date, drillWeekends),
    });
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      drills: getDrillsForDate(date, drillWeekends),
    });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      drills: getDrillsForDate(date, drillWeekends),
    });
  }

  return days;
}

function getDrillsForDate(date: Date, drillWeekends: DrillWeekend[]): DrillWeekend[] {
  const dateStr = date.toISOString().split('T')[0];

  return drillWeekends.filter(drill => {
    const start = drill.startDate;
    const end = drill.endDate;
    return dateStr >= start && dateStr <= end;
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DrillCalendar({
  drillWeekends,
  onDrillPress,
  onDatePress,
  selectedDate,
}: DrillCalendarProps) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(year, month, drillWeekends),
    [year, month, drillWeekends]
  );

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayPress = (day: CalendarDay) => {
    if (day.drills.length > 0 && onDrillPress) {
      onDrillPress(day.drills[0]);
    } else if (onDatePress) {
      onDatePress(day.date);
    }
  };

  const isSelected = (day: CalendarDay) => {
    if (!selectedDate) return false;
    return day.date.toDateString() === selectedDate.toDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday}>
          <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
            {MONTH_NAMES[month]} {year}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day of week headers */}
      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.weekDay}>
            <Text style={[styles.weekDayText, { color: theme.colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, index) => {
          const hasDrill = day.drills.length > 0;
          const drillStatus = hasDrill ? getDrillStatus(day.drills[0]) : null;
          const statusColor = drillStatus ? getStatusColor(drillStatus, theme) : undefined;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.isToday && [styles.todayCell, { borderColor: theme.colors.primary }],
                isSelected(day) && [styles.selectedCell, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: day.isCurrentMonth
                      ? isSelected(day)
                        ? '#fff'
                        : theme.colors.text
                      : theme.colors.textTertiary,
                  },
                ]}
              >
                {day.dayOfMonth}
              </Text>

              {hasDrill && (
                <View style={styles.drillIndicators}>
                  {day.drills.slice(0, 3).map((drill, i) => (
                    <View
                      key={i}
                      style={[
                        styles.drillDot,
                        { backgroundColor: getStatusColor(getDrillStatus(drill), theme) },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: theme.colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Scheduled
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.income }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.expense }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Missed
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// DRILL LIST COMPONENT
// ============================================================================

interface DrillListProps {
  drillWeekends: DrillWeekend[];
  onDrillPress?: (drill: DrillWeekend) => void;
  showPast?: boolean;
}

export function DrillList({ drillWeekends, onDrillPress, showPast = false }: DrillListProps) {
  const theme = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const filteredDrills = useMemo(() => {
    const sorted = [...drillWeekends].sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    if (showPast) {
      return sorted;
    }

    return sorted.filter(d => d.endDate >= today);
  }, [drillWeekends, showPast, today]);

  if (filteredDrills.length === 0) {
    return (
      <View style={styles.emptyList}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No {showPast ? '' : 'upcoming '}drills scheduled
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      {filteredDrills.map((drill) => {
        const status = getDrillStatus(drill);
        const statusColor = getStatusColor(status, theme);
        const isPast = drill.endDate < today;

        return (
          <TouchableOpacity
            key={drill.id}
            style={[
              styles.drillCard,
              { backgroundColor: theme.colors.card },
              isPast && styles.pastDrill,
            ]}
            onPress={() => onDrillPress?.(drill)}
            activeOpacity={0.7}
          >
            <View style={[styles.drillStatusBar, { backgroundColor: statusColor }]} />

            <View style={styles.drillContent}>
              <View style={styles.drillHeader}>
                <View style={styles.drillTitleRow}>
                  <Ionicons
                    name={getEventTypeIcon(drill.eventType) as any}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.drillTitle, { color: theme.colors.text }]}>
                    {drill.title}
                  </Text>
                </View>
                <View style={[styles.mutaBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.mutaText, { color: theme.colors.primary }]}>
                    MUTA {drill.mutaCount}
                  </Text>
                </View>
              </View>

              <View style={styles.drillDetails}>
                <View style={styles.drillDetail}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.drillDetailText, { color: theme.colors.textSecondary }]}>
                    {formatDateRange(drill.startDate, drill.endDate)}
                  </Text>
                </View>

                {drill.location && (
                  <View style={styles.drillDetail}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.drillDetailText, { color: theme.colors.textSecondary }]}>
                      {drill.location}
                    </Text>
                  </View>
                )}
              </View>

              {/* Period status indicators */}
              <View style={styles.periodIndicators}>
                {drill.periods.map((period, i) => (
                  <View
                    key={period.id}
                    style={[
                      styles.periodDot,
                      { backgroundColor: getStatusColor(period.status, theme) },
                    ]}
                  />
                ))}
              </View>

              {/* Pay status */}
              {status === 'completed' && (
                <View style={styles.payStatus}>
                  <Ionicons
                    name={drill.isPaid ? 'checkmark-circle' : 'time-outline'}
                    size={14}
                    color={drill.isPaid ? theme.colors.income : theme.colors.warning}
                  />
                  <Text
                    style={[
                      styles.payStatusText,
                      { color: drill.isPaid ? theme.colors.income : theme.colors.warning },
                    ]}
                  >
                    {drill.isPaid
                      ? `Paid${drill.actualPay ? `: $${drill.actualPay.toFixed(2)}` : ''}`
                      : 'Awaiting payment'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startMonth = MONTH_NAMES[startDate.getMonth()].substring(0, 3);
  const endMonth = MONTH_NAMES[endDate.getMonth()].substring(0, 3);

  if (start === end) {
    return `${startMonth} ${startDate.getDate()}`;
  }

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}`;
  }

  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xs,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  todayCell: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
  },
  selectedCell: {
    borderRadius: borderRadius.md,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  drillIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  drillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
  },

  // List
  listContainer: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },

  // Drill card
  drillCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  pastDrill: {
    opacity: 0.7,
  },
  drillStatusBar: {
    width: 4,
  },
  drillContent: {
    flex: 1,
    padding: spacing.md,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  drillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  drillTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  mutaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  mutaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  drillDetails: {
    gap: spacing.xs,
  },
  drillDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  drillDetailText: {
    fontSize: typography.fontSize.sm,
  },
  periodIndicators: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  payStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  payStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
