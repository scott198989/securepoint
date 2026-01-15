/**
 * Deployment Status Screen
 * Detailed view of current deployment status and pay adjustments
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useDeploymentStore } from '../../store/deploymentStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { DEPLOYMENT_PAY_RATES } from '../../constants/deploymentData';

export default function DeploymentStatusScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const {
    activeDeployment,
    endDeployment,
    updatePayAdjustments,
    getCountdown,
  } = useDeploymentStore();

  const countdown = getCountdown();

  if (!activeDeployment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
          No active deployment
        </Text>
      </View>
    );
  }

  const handleEndDeployment = () => {
    Alert.alert(
      'End Deployment',
      'Are you sure you want to end this deployment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Deployment',
          style: 'destructive',
          onPress: () => {
            endDeployment(new Date().toISOString().split('T')[0]);
            router.replace('/deployment' as never);
          },
        },
      ]
    );
  };

  const togglePayAdjustment = (key: string, value: boolean) => {
    updatePayAdjustments({ [key]: value });
  };

  const { payAdjustments } = activeDeployment;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Status header */}
      <Card style={[styles.statusCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.statusHeader}>
          <Ionicons name="airplane" size={32} color="#fff" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Deployment Active</Text>
            <Text style={styles.statusLocation}>
              {activeDeployment.location.locationName}
            </Text>
          </View>
        </View>
        {countdown && (
          <View style={styles.statusStats}>
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>{countdown.daysComplete}</Text>
              <Text style={styles.statusStatLabel}>Days In</Text>
            </View>
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>{countdown.daysRemaining}</Text>
              <Text style={styles.statusStatLabel}>Days Left</Text>
            </View>
            <View style={styles.statusStat}>
              <Text style={styles.statusStatValue}>{Math.round(countdown.percentComplete)}%</Text>
              <Text style={styles.statusStatLabel}>Complete</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Pay Adjustments */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Pay Adjustments
        </Text>

        <TouchableOpacity
          style={styles.adjustmentRow}
          onPress={() => togglePayAdjustment('hostileFirePay', !payAdjustments.hostileFirePay)}
        >
          <View style={styles.adjustmentLeft}>
            <Ionicons
              name={payAdjustments.hostileFirePay ? 'checkbox' : 'square-outline'}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.adjustmentInfo}>
              <Text style={[styles.adjustmentTitle, { color: theme.colors.text }]}>
                Hostile Fire Pay
              </Text>
              <Text style={[styles.adjustmentAmount, { color: theme.colors.income }]}>
                +{formatCurrency(DEPLOYMENT_PAY_RATES.hostileFirePay)}/mo
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustmentRow}
          onPress={() => togglePayAdjustment('familySeparationAllowance', !payAdjustments.familySeparationAllowance)}
        >
          <View style={styles.adjustmentLeft}>
            <Ionicons
              name={payAdjustments.familySeparationAllowance ? 'checkbox' : 'square-outline'}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.adjustmentInfo}>
              <Text style={[styles.adjustmentTitle, { color: theme.colors.text }]}>
                Family Separation Allowance
              </Text>
              <Text style={[styles.adjustmentAmount, { color: theme.colors.income }]}>
                +{formatCurrency(DEPLOYMENT_PAY_RATES.familySeparationAllowance)}/mo
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustmentRow}
          onPress={() => togglePayAdjustment('combatZoneTaxExclusion', !payAdjustments.combatZoneTaxExclusion)}
        >
          <View style={styles.adjustmentLeft}>
            <Ionicons
              name={payAdjustments.combatZoneTaxExclusion ? 'checkbox' : 'square-outline'}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.adjustmentInfo}>
              <Text style={[styles.adjustmentTitle, { color: theme.colors.text }]}>
                Combat Zone Tax Exclusion
              </Text>
              <Text style={[styles.adjustmentAmount, { color: theme.colors.income }]}>
                Tax-free income
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            Additional Monthly Pay
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.income }]}>
            +{formatCurrency(payAdjustments.additionalMonthlyPay)}
          </Text>
        </View>
      </Card>

      {/* Deployment Details */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Deployment Details
        </Text>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Type</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {activeDeployment.type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Departure</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {new Date(activeDeployment.departureDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Expected Return</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {new Date(activeDeployment.expectedReturnDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Location</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {activeDeployment.location.locationName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Hazardous</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {activeDeployment.location.isHazardous ? 'Yes' : 'No'}
          </Text>
        </View>
      </Card>

      {/* End Deployment Button */}
      <TouchableOpacity
        style={[styles.endButton, { borderColor: theme.colors.expense }]}
        onPress={handleEndDeployment}
      >
        <Ionicons name="stop-circle-outline" size={20} color={theme.colors.expense} />
        <Text style={[styles.endButtonText, { color: theme.colors.expense }]}>
          End Deployment
        </Text>
      </TouchableOpacity>
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
  noData: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },

  // Status card
  statusCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusInfo: {
    marginLeft: spacing.md,
  },
  statusTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statusLocation: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  statusStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusStat: {
    alignItems: 'center',
  },
  statusStatValue: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  statusStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Section
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  // Adjustments
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  adjustmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  adjustmentInfo: {},
  adjustmentTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  adjustmentAmount: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
  },
  totalAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // End button
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  endButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
