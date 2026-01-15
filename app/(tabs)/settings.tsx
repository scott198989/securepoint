// Settings screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../hooks';
import { useSettingsStore } from '../../store';
import { Card } from '../../components/common';
import { typography, borderRadius } from '../../constants/theme';
import { APP_VERSION } from '../../constants';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { settings, setTheme, setNotificationPreference, setPrivacyPreference } = useSettingsStore();

  const handleLogout = () => {
    const performLogout = () => {
      logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      // Use browser confirm for web
      if (window.confirm('Are you sure you want to sign out?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const SettingsItem = ({
    label,
    value,
    onPress,
    rightElement,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>{label}</Text>
      {rightElement || (
        <Text style={[styles.settingsValue, { color: theme.colors.textSecondary }]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );

  const SettingsToggle = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingsItem, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
    >
      {/* Header */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      {/* Profile Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <SettingsItem
          label="Email"
          value={user?.email || 'Not signed in'}
        />
        <SettingsItem
          label="Display Name"
          value={user?.displayName || 'Set name'}
          onPress={() => {/* Navigate to profile edit */}}
        />
        <SettingsItem
          label="Military Profile"
          value={user?.militaryProfile?.status?.replace('_', ' ') || 'Set up'}
          onPress={() => {/* Navigate to military profile */}}
        />
        <SettingsItem
          label="Subscription"
          value={user?.isPremium ? 'Premium' : 'Free'}
          onPress={() => {/* Navigate to subscription */}}
        />
      </Card>

      {/* Appearance Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <TouchableOpacity
          style={[styles.settingsItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => {
            const themes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
            const currentIndex = themes.indexOf(settings.theme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            setTheme(nextTheme);
          }}
        >
          <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>Theme</Text>
          <View style={styles.themeSelector}>
            {(['system', 'light', 'dark'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeOption,
                  settings.theme === t && { backgroundColor: theme.colors.primary },
                  settings.theme !== t && { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={() => setTheme(t)}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: settings.theme === t ? '#ffffff' : theme.colors.textSecondary },
                  ]}
                >
                  {t === 'system' ? 'Auto' : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Card>

      {/* Notifications Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        <SettingsToggle
          label="Bill Reminders"
          value={settings.notifications.billReminders}
          onValueChange={(value) => setNotificationPreference('billReminders', value)}
        />
        <SettingsToggle
          label="Budget Alerts"
          value={settings.notifications.budgetAlerts}
          onValueChange={(value) => setNotificationPreference('budgetAlerts', value)}
        />
        <SettingsToggle
          label="Savings Goals"
          value={settings.notifications.savingsGoals}
          onValueChange={(value) => setNotificationPreference('savingsGoals', value)}
        />
      </Card>

      {/* Privacy Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          PRIVACY & SECURITY
        </Text>
        <SettingsToggle
          label="Local-Only Mode"
          value={settings.privacy.localOnlyMode}
          onValueChange={(value) => setPrivacyPreference('localOnlyMode', value)}
        />
        <SettingsToggle
          label="Biometric Lock"
          value={settings.privacy.biometricLock}
          onValueChange={(value) => setPrivacyPreference('biometricLock', value)}
        />
        <SettingsItem
          label="Export Data"
          onPress={() => {/* Handle export */}}
          rightElement={
            <Text style={{ color: theme.colors.primary }}>Export</Text>
          }
        />
        <SettingsItem
          label="Delete All Data"
          onPress={() => {
            const handleDelete = () => {
              // Handle delete - clear all stores
            };

            if (Platform.OS === 'web') {
              if (window.confirm('This will permanently delete all your data. This action cannot be undone. Are you sure?')) {
                handleDelete();
              }
            } else {
              Alert.alert(
                'Delete All Data',
                'This will permanently delete all your data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: handleDelete },
                ]
              );
            }
          }}
          rightElement={
            <Text style={{ color: theme.colors.expense }}>Delete</Text>
          }
        />
      </Card>

      {/* About Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ABOUT
        </Text>
        <SettingsItem label="Version" value={APP_VERSION} />
        <SettingsItem
          label="Privacy Policy"
          onPress={() => {/* Open privacy policy */}}
        />
        <SettingsItem
          label="Terms of Service"
          onPress={() => {/* Open terms */}}
        />
        <SettingsItem
          label="Help & Support"
          onPress={() => {/* Open help */}}
        />
      </Card>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: theme.colors.card }]}
        onPress={handleLogout}
      >
        <Text style={[styles.signOutText, { color: theme.colors.expense }]}>
          Sign Out
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          $ecurePoint v{APP_VERSION}
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Built for those who serve
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
    padding: 0,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingsLabel: {
    fontSize: typography.fontSize.md,
  },
  settingsValue: {
    fontSize: typography.fontSize.md,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  themeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  signOutButton: {
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signOutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
});
