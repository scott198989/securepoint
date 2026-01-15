/**
 * VA Claims Screen
 * Track and manage VA disability claims
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { VAClaimStatus } from '../../types/transition';

const STATUS_OPTIONS: { status: VAClaimStatus; label: string; color: string }[] = [
  { status: 'not_filed', label: 'Not Filed', color: '#9E9E9E' },
  { status: 'gathering_evidence', label: 'Gathering Evidence', color: '#FF9800' },
  { status: 'submitted', label: 'Submitted', color: '#2196F3' },
  { status: 'under_review', label: 'Under Review', color: '#9C27B0' },
  { status: 'decision_pending', label: 'Decision Pending', color: '#FF5722' },
  { status: 'awarded', label: 'Awarded', color: '#4CAF50' },
  { status: 'denied', label: 'Denied', color: '#F44336' },
  { status: 'appealing', label: 'Appealing', color: '#E91E63' },
];

export default function VAClaimsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    vaDisability,
    initializeVADisability,
    addVAClaim,
    updateVAClaim,
    removeVAClaim,
    setVADependents,
    calculateCombinedRating,
    calculateVACompensation,
  } = useTransitionStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [newRating, setNewRating] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initialize if needed
  React.useEffect(() => {
    if (!vaDisability) {
      initializeVADisability();
    }
  }, []);

  const handleAddClaim = () => {
    if (!newCondition.trim() || !newRating) return;

    addVAClaim({
      condition: newCondition.trim(),
      claimedRating: parseInt(newRating) || 0,
      serviceConnected: true,
      status: 'not_filed',
    });

    setNewCondition('');
    setNewRating('');
    setShowAddForm(false);
  };

  const handleUpdateStatus = (claimId: string, status: VAClaimStatus) => {
    updateVAClaim(claimId, { status });

    // If awarded, prompt for actual rating
    if (status === 'awarded') {
      // For simplicity, set a default awarded rating matching claimed rating
      const claim = vaDisability?.individualRatings?.find((c) => c.id === claimId);
      if (claim) {
        updateVAClaim(claimId, { awardedRating: claim.claimedRating });
      }
    }
  };

  const handleDeleteClaim = (claimId: string) => {
    Alert.alert(
      'Delete Claim',
      'Are you sure you want to delete this claim?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeVAClaim(claimId),
        },
      ]
    );
  };

  const getStatusColor = (status: VAClaimStatus) => {
    return STATUS_OPTIONS.find((s) => s.status === status)?.color || '#9E9E9E';
  };

  const getStatusLabel = (status: VAClaimStatus) => {
    return STATUS_OPTIONS.find((s) => s.status === status)?.label || status;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Summary card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.summaryHeader}>
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
          <Text style={styles.summaryTitle}>VA Disability</Text>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {vaDisability?.combinedRating || 0}%
            </Text>
            <Text style={styles.summaryLabel}>Combined Rating</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {formatCurrency(vaDisability?.monthlyCompensation || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Monthly Pay</Text>
          </View>
        </View>
      </Card>

      {/* Dependents */}
      <Card style={styles.dependentsCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Dependents
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          Dependents affect compensation for 30%+ ratings
        </Text>

        <View style={styles.dependentsRow}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setVADependents(!vaDisability?.hasSpouse, vaDisability?.dependentCount || 0)}
          >
            <Ionicons
              name={vaDisability?.hasSpouse ? 'checkbox' : 'square-outline'}
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
              Spouse
            </Text>
          </TouchableOpacity>

          <View style={styles.dependentCounter}>
            <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>
              Children:
            </Text>
            <TouchableOpacity
              style={[styles.counterButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                const count = Math.max(0, (vaDisability?.dependentCount || 0) - 1);
                setVADependents(vaDisability?.hasSpouse || false, count);
              }}
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: theme.colors.text }]}>
              {vaDisability?.dependentCount || 0}
            </Text>
            <TouchableOpacity
              style={[styles.counterButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                const count = (vaDisability?.dependentCount || 0) + 1;
                setVADependents(vaDisability?.hasSpouse || false, count);
              }}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Claims list */}
      <View style={styles.claimsHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Claims ({vaDisability?.individualRatings?.length || 0})
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Claim</Text>
        </TouchableOpacity>
      </View>

      {/* Add form */}
      {showAddForm && (
        <Card style={styles.addFormCard}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            New Claim
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
              Condition
            </Text>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={newCondition}
              onChangeText={setNewCondition}
              placeholder="e.g., Tinnitus, PTSD, Back Pain"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
              Claimed Rating (%)
            </Text>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={newRating}
              onChangeText={setNewRating}
              placeholder="e.g., 10, 30, 50"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setShowAddForm(false);
                setNewCondition('');
                setNewRating('');
              }}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddClaim}
            >
              <Text style={styles.saveButtonText}>Add Claim</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Claims */}
      {vaDisability?.individualRatings?.map((claim) => (
        <Card key={claim.id} style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <View style={styles.claimInfo}>
              <Text style={[styles.claimCondition, { color: theme.colors.text }]}>
                {claim.condition}
              </Text>
              <View style={styles.claimRatings}>
                <Text style={[styles.claimRating, { color: theme.colors.textSecondary }]}>
                  Claimed: {claim.claimedRating}%
                </Text>
                {claim.awardedRating !== undefined && (
                  <Text style={[styles.claimRating, { color: theme.colors.income }]}>
                    Awarded: {claim.awardedRating}%
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteClaim(claim.id)}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '20' }]}
            >
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(claim.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>
                {getStatusLabel(claim.status)}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusOptions}
          >
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.status}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      claim.status === option.status
                        ? option.color
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => handleUpdateStatus(claim.id, option.status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    {
                      color: claim.status === option.status ? '#fff' : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>
      ))}

      {(!vaDisability?.individualRatings || vaDisability.individualRatings.length === 0) && !showAddForm && (
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Claims Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Add your VA disability claims to track their status and calculate your combined rating.
          </Text>
        </Card>
      )}

      {/* VA Math explanation */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="calculator-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            Understanding VA Math
          </Text>
        </View>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          VA ratings are combined using a specific formula, not added together. Each rating is applied to the remaining "whole person" after previous ratings.
          {'\n\n'}
          Example: 50% + 30% = 65% (not 80%)
          {'\n'}
          First: 50% of 100 = 50% disabled
          {'\n'}
          Then: 30% of remaining 50% = 15%
          {'\n'}
          Total: 50% + 15% = 65%
        </Text>
      </Card>
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

  // Summary card
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Section title
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Dependents
  dependentsCard: {
    marginBottom: spacing.md,
  },
  dependentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.md,
  },
  dependentCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterLabel: {
    fontSize: typography.fontSize.sm,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    minWidth: 24,
    textAlign: 'center',
  },

  // Claims header
  claimsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Add form
  addFormCard: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Claim card
  claimCard: {
    marginBottom: spacing.sm,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  claimInfo: {},
  claimCondition: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  claimRatings: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  claimRating: {
    fontSize: typography.fontSize.sm,
  },
  statusContainer: {
    marginTop: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statusOptions: {
    marginTop: spacing.md,
  },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  statusOptionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  // Info card
  infoCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
