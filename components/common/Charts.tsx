// Chart components for budget visualization

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks';
import { typography } from '../../constants/theme';

interface PieChartData {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number; // For donut chart
  showLabels?: boolean;
}

export function PieChart({
  data,
  size = 200,
  innerRadius = 0,
  showLabels = true,
}: PieChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={[styles.emptyChart, { width: size, height: size }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No data
        </Text>
      </View>
    );
  }

  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Calculate pie slices
  let currentAngle = -90; // Start from top
  const slices = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Large arc flag
    const largeArc = angle > 180 ? 1 : 0;

    // Create path
    let path: string;
    if (innerRadius > 0) {
      // Donut chart
      const innerX1 = centerX + innerRadius * Math.cos(startRad);
      const innerY1 = centerY + innerRadius * Math.sin(startRad);
      const innerX2 = centerX + innerRadius * Math.cos(endRad);
      const innerY2 = centerY + innerRadius * Math.sin(endRad);

      path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1}
        Z
      `;
    } else {
      // Full pie
      path = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;
    }

    return {
      ...item,
      path,
      percentage,
      midAngle: (startAngle + endAngle) / 2,
    };
  });

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <Path key={index} d={slice.path} fill={slice.color} />
          ))}
        </G>
      </Svg>
      {showLabels && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text
                style={[styles.legendLabel, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text style={[styles.legendValue, { color: theme.colors.textSecondary }]}>
                {Math.round((item.value / total) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface BarChartData {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  barHeight?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  height,
  barHeight = 24,
  showValues = true,
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const theme = useTheme();

  return (
    <View style={[styles.barChartContainer, height ? { height } : undefined]}>
      {data.map((item, index) => {
        const percentage = item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0;
        const isOver = percentage > 100;

        return (
          <View key={index} style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text
                style={[styles.barLabel, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {showValues && (
                <Text
                  style={[
                    styles.barValue,
                    { color: isOver ? theme.colors.expense : theme.colors.textSecondary },
                  ]}
                >
                  {formatValue(item.value)} / {formatValue(item.maxValue)}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.barTrack,
                {
                  height: barHeight,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOver ? theme.colors.expense : item.color,
                  },
                ]}
              />
              {isOver && (
                <View
                  style={[
                    styles.barOverflow,
                    {
                      width: `${Math.min(percentage - 100, 20)}%`,
                      backgroundColor: theme.colors.expense + '60',
                    },
                  ]}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Simple horizontal progress bar for single values
interface ProgressBarProps {
  value: number;
  maxValue: number;
  color: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  maxValue,
  color,
  height = 8,
  showPercentage = false,
}: ProgressBarProps) {
  const theme = useTheme();
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const isOver = percentage > 100;

  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressTrack,
          {
            height,
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOver ? theme.colors.expense : color,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text
          style={[
            styles.progressText,
            { color: isOver ? theme.colors.expense : theme.colors.textSecondary },
          ]}
        >
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
  },
  emptyChart: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
  legend: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  legendValue: {
    fontSize: typography.fontSize.sm,
    marginLeft: 8,
  },
  // Bar chart
  barChartContainer: {
    width: '100%',
  },
  barItem: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    marginLeft: 8,
  },
  barTrack: {
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barOverflow: {
    height: '100%',
    position: 'absolute',
    right: 0,
  },
  // Progress bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    marginLeft: 8,
    minWidth: 35,
    textAlign: 'right',
  },
});
