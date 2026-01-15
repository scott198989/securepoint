/**
 * Benefits Calculator Screen
 * Full VA and retirement benefits calculator
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card } from '../../components/common';
import { BenefitsCalculator } from '../../components/transition';
import { typography, spacing } from '../../constants/theme';

export default function BenefitsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Header */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <Ionicons name="calculator" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Benefits Calculator</Text>
        <Text style={styles.headerSubtitle}>
          Estimate your VA disability and military retirement pay
        </Text>
      </Card>

      {/* Calculator */}
      <BenefitsCalculator mode="combined" />

      {/* Important notes */}
      <Card style={[styles.notesCard, { backgroundColor: theme.colors.warning + '10' }]}>
        <View style={styles.noteHeader}>
          <Ionicons name="information-circle" size={24} color={theme.colors.warning} />
          <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
            Important Notes
          </Text>
        </View>

        <View style={styles.noteList}>
          <View style={styles.noteItem}>
            <Text style={[styles.noteBullet, { color: theme.colors.warning }]}>•</Text>
            <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
              VA disability ratings use "VA math" - ratings are combined, not added. A 50% + 30% = 65%, not 80%.
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={[styles.noteBullet, { color: theme.colors.warning }]}>•</Text>
            <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
              CRDP allows concurrent receipt of full retirement and VA pay for those with 50%+ rating.
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={[styles.noteBullet, { color: theme.colors.warning }]}>•</Text>
            <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
              VA compensation is tax-free at federal and state levels.
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={[styles.noteBullet, { color: theme.colors.warning }]}>•</Text>
            <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
              These are estimates only. Contact the VA and DFAS for official calculations.
            </Text>
          </View>
        </View>
      </Card>

      {/* Resources */}
      <Card style={styles.resourcesCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Helpful Resources
        </Text>

        <View style={styles.resourceList}>
          <View style={styles.resourceItem}>
            <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.resourceText, { color: theme.colors.text }]}>
              VA.gov - File claims online
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.resourceText, { color: theme.colors.text }]}>
              myPay - View LES and retirement estimates
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.resourceText, { color: theme.colors.text }]}>
              TSP.gov - Thrift Savings Plan
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.resourceText, { color: theme.colors.text }]}>
              MilitaryOneSource - Transition assistance
            </Text>
          </View>
        </View>
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

  // Header card
  headerCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Notes card
  notesCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noteTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  noteList: {
    gap: spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noteBullet: {
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  noteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Resources card
  resourcesCard: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  resourceList: {
    gap: spacing.sm,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  resourceText: {
    fontSize: typography.fontSize.md,
  },
});
