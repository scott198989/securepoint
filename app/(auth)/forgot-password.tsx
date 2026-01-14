// Forgot password screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';
import { Button, Input } from '../../components/common';
import { typography } from '../../constants/theme';
import { isValidEmail } from '../../utils/validators';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <View
        style={[
          styles.container,
          styles.centeredContainer,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={styles.successEmoji}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Check your email
          </Text>
          <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
            We've sent password reset instructions to {email}
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.back()}
            fullWidth
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email and we'll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backLink: {
    marginBottom: 20,
  },
  backText: {
    fontSize: typography.fontSize.md,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  // Success state styles
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    marginTop: 16,
  },
});
