/**
 * Transition Hub Screen
 * Main dashboard for transition planning
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { TransitionTimeline, BenefitsCalculator } from '../../components/transition';
import { typography, borderRadius, spacing } from '../../constants/theme';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface QuickActionProps {
  icon: IoniconsName;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

function QuickAction({ icon, title, subtitle, onPress, color }: QuickActionProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <Card style={styles.quickActionCard}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.quickActionSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function TransitionHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { transitionInfo, getTransitionSummary } = useTransitionStore();

  const summary = getTransitionSummary();

  // If no transition info, show setup prompt
  if (!transitionInfo) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Card style={[styles.setupCard, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="exit-outline" size={48} color="#fff" />
          <Text style={styles.setupTitle}>Plan Your Transition</Text>
          <Text style={styles.setupSubtitle}>
            Get ready for your next chapter with personalized timelines,
            benefit calculators, and comprehensive checklists.
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/transition/setup' as never)}
          >
            <Text style={[styles.setupButtonText, { color: theme.colors.primary }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          What You'll Get
        </Text>

        <View style={styles.featureList}>
          {[
            { icon: 'calendar-outline', title: 'ETS Countdown', desc: 'Track days until separation' },
            { icon: 'calculator-outline', title: 'Benefits Calculator', desc: 'Estimate VA & retirement pay' },
            { icon: 'checkbox-outline', title: 'Transition Checklist', desc: 'Step-by-step guidance' },
            { icon: 'cash-outline', title: 'Income Comparison', desc: 'Military vs civilian salary' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name={feature.icon as IoniconsName} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Timeline countdown */}
      <TransitionTimeline compact />

      {/* Quick actions grid */}
      <View style={styles.quickActionsGrid}>
        <QuickAction
          icon="calendar"
          title="Countdown"
          subtitle="Track your timeline"
          onPress={() => router.push('/transition/countdown' as never)}
          color={theme.colors.primary}
        />
        <QuickAction
          icon="calculator"
          title="Benefits"
          subtitle="VA & Retirement"
          onPress={() => router.push('/transition/benefits' as never)}
          color={theme.colors.income}
        />
        <QuickAction
          icon="shield-checkmark"
          title="VA Claims"
          subtitle="Track your claims"
          onPress={() => router.push('/transition/va-claims' as never)}
          color="#4CAF50"
        />
        <QuickAction
          icon="checkbox"
          title="Checklist"
          subtitle="Stay on track"
          onPress={() => router.push('/transition/checklist' as never)}
          color={theme.colors.warning}
        />
      </View>

      {/* Benefits summary */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Estimated Benefits
      </Text>
      <BenefitsCalculator mode="combined" compact />

      {/* More tools */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        More Tools
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/transition/comparison' as never)}
      >
        <Card style={styles.toolCard}>
          <View style={styles.toolContent}>
            <View style={[styles.toolIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="git-compare" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: theme.colors.text }]}>
                Income Comparison
              </Text>
              <Text style={[styles.toolDesc, { color: theme.colors.textSecondary }]}>
                Compare military vs civilian compensation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/transition/tsp' as never)}
      >
        <Card style={styles.toolCard}>
          <View style={styles.toolContent}>
            <View style={[styles.toolIcon, { backgroundColor: theme.colors.income + '20' }]}>
              <Ionicons name="trending-up" size={24} color={theme.colors.income} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={[styles.toolTitle, { color: theme.colors.text }]}>
                TSP Options
              </Text>
              <Text style={[styles.toolDesc, { color: theme.colors.textSecondary }]}>
                Rollover and withdrawal strategies
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </Card>
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

  // Setup card
  setupCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  setupTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  setupSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  setupButton: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  setupButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Section title
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // Feature list
  featureList: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {},
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  featureDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickAction: {
    width: '48%',
  },
  quickActionCard: {
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: typography.fontSize.sm,
  },

  // Tool cards
  toolCard: {
    marginBottom: spacing.sm,
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  toolDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
