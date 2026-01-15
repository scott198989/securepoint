/**
 * Eligibility Hub Screen
 * Entry point for special pay eligibility assessment
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card, Button } from '../../components/common';
import { PAY_TYPE_INFO, getAvailablePayTypes } from '../../constants/eligibilityRules';
import { typography, borderRadius, spacing } from '../../constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EligibilityHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const payTypes = getAvailablePayTypes();

  const handleStartWizard = () => {
    router.push('/eligibility/wizard' as any);
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'skill':
        return 'ribbon';
      case 'hazard':
        return 'warning';
      case 'assignment':
        return 'briefcase';
      case 'incentive':
        return 'gift';
      case 'medical':
        return 'medical';
      case 'location':
        return 'location';
      default:
        return 'cash';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'skill':
        return theme.colors.primary;
      case 'hazard':
        return theme.colors.expense;
      case 'assignment':
        return theme.colors.warning;
      case 'incentive':
        return theme.colors.income;
      case 'medical':
        return theme.colors.info;
      case 'location':
        return '#8b5cf6';
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Hero Section */}
      <Card style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.heroIcon}>
          <Ionicons name="help-circle" size={48} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Are You Missing Pay?</Text>
        <Text style={styles.heroSubtitle}>
          Answer a few questions to discover special pays you might be eligible for but aren't receiving.
        </Text>
        <Button
          title="Start Assessment"
          onPress={handleStartWizard}
          variant="outline"
          style={styles.heroButton}
        />
      </Card>

      {/* Info Section */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.info + '15' }]}>
        <Ionicons name="information-circle" size={24} color={theme.colors.info} />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            How This Works
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            We'll ask about your qualifications, assignments, and duty status. Based on your answers, we'll identify special pays you may qualify for and provide next steps.
          </Text>
        </View>
      </Card>

      {/* Available Pay Types */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Special Pays We Check
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          {payTypes.length} pay types in our database
        </Text>

        {payTypes.map((payType) => {
          const info = PAY_TYPE_INFO[payType];
          if (!info) return null;

          const categoryColor = getCategoryColor(info.category);
          const categoryIcon = getCategoryIcon(info.category);

          return (
            <TouchableOpacity
              key={payType}
              style={[styles.payTypeCard, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.7}
            >
              <View style={[styles.payTypeIcon, { backgroundColor: categoryColor + '20' }]}>
                <Ionicons name={categoryIcon as any} size={20} color={categoryColor} />
              </View>
              <View style={styles.payTypeContent}>
                <Text style={[styles.payTypeName, { color: theme.colors.text }]}>
                  {info.shortName}
                </Text>
                <Text style={[styles.payTypeDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {info.description}
                </Text>
                <View style={styles.payTypeFooter}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                      {info.category.charAt(0).toUpperCase() + info.category.slice(1)}
                    </Text>
                  </View>
                  <Text style={[styles.payRange, { color: theme.colors.income }]}>
                    ${info.payRange.min}-${info.payRange.max}/mo
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tips Section */}
      <Card style={styles.tipsCard}>
        <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
          Tips for Best Results
        </Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Have your LES handy to verify current pays
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Know your current qualifications and certifications
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Check your assignment orders for duty codes
            </Text>
          </View>
        </View>
      </Card>
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

  // Hero Card
  heroCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroButton: {
    borderColor: '#fff',
    minWidth: 200,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    marginBottom: spacing.md,
  },

  // Pay Type Card
  payTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  payTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTypeContent: {
    flex: 1,
  },
  payTypeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  payTypeDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  payTypeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  payRange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Tips Card
  tipsCard: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
