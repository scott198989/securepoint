// Registration screen

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
import { useAuth, useTheme } from '../../hooks';
import { Button, Input } from '../../components/common';
import { typography } from '../../constants/theme';
import { isValidEmail, isValidPassword, getValidationError, passwordSchema } from '../../utils/validators';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { register, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordError = getValidationError(passwordSchema, password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();

    if (!validateForm()) return;

    const success = await register(email, password);
    if (success) {
      router.replace('/(tabs)/dashboard');
    }
  };

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
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Start managing your military finances
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
            rightIcon={
              <Text style={{ color: theme.colors.primary }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementTitle, { color: theme.colors.textSecondary }]}>
              Password must have:
            </Text>
            <Text style={[
              styles.requirement,
              { color: password.length >= 8 ? theme.colors.income : theme.colors.textSecondary }
            ]}>
              At least 8 characters
            </Text>
            <Text style={[
              styles.requirement,
              { color: /[A-Za-z]/.test(password) ? theme.colors.income : theme.colors.textSecondary }
            ]}>
              At least one letter
            </Text>
            <Text style={[
              styles.requirement,
              { color: /[0-9]/.test(password) ? theme.colors.income : theme.colors.textSecondary }
            ]}>
              At least one number
            </Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
            By creating an account, you agree to our{' '}
            <Text style={{ color: theme.colors.primary }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
  },
  form: {
    flex: 1,
  },
  passwordRequirements: {
    marginBottom: 24,
  },
  requirementTitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  requirement: {
    fontSize: typography.fontSize.sm,
    marginLeft: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: typography.fontSize.sm,
    marginBottom: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: typography.fontSize.md,
  },
  linkText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
