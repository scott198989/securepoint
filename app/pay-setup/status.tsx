// Duty Status step - duty status and component selection

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { DutyStatus, MilitaryComponent } from '../../types';
import { Button } from '../../components/common';
import { DutyStatusSelector } from '../../components/military';
import { spacing } from '../../constants/theme';

export default function StatusStepScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile, updatePayProfile } = usePayProfileStore();

  const [dutyStatus, setDutyStatus] = useState<DutyStatus>(
    payProfile?.dutyStatus || 'active_duty'
  );
  const [component, setComponent] = useState<MilitaryComponent>(
    payProfile?.component || 'active'
  );
  const [error, setError] = useState<string | undefined>();

  const handleContinue = () => {
    if (!dutyStatus) {
      setError('Please select a duty status');
      return;
    }

    updatePayProfile({
      dutyStatus,
      component,
    });

    router.push('/pay-setup/location');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <DutyStatusSelector
        status={dutyStatus}
        component={component}
        onStatusChange={(status) => {
          setDutyStatus(status);
          setError(undefined);
        }}
        onComponentChange={setComponent}
        error={error}
      />

      <Button
        title="Continue"
        onPress={handleContinue}
        style={styles.continueButton}
      />
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
  continueButton: {
    marginTop: spacing.lg,
  },
});
