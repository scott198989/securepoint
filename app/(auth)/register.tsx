/**
 * Registration Screen
 * Multi-step registration with military profile collection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useTheme } from '../../hooks';
import { Button, Input, GlassCard } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { isValidEmail, isValidPassword, getValidationError, passwordSchema } from '../../utils/validators';
import {
  MilitaryBranch,
  MilitaryStatus,
  PayGrade,
  OrdersType,
  GuardReserveTitle,
} from '../../types/user';
import { backgrounds } from '../../assets/backgrounds';

// Step configuration
const STEPS = ['credentials', 'branch', 'rank', 'dates', 'status', 'location'] as const;
type Step = typeof STEPS[number];

// Branch data with icons
const BRANCHES: { id: MilitaryBranch; name: string; icon: string }[] = [
  { id: 'army', name: 'Army', icon: 'shield' },
  { id: 'navy', name: 'Navy', icon: 'boat' },
  { id: 'air_force', name: 'Air Force', icon: 'airplane' },
  { id: 'marine_corps', name: 'Marine Corps', icon: 'fitness' },
  { id: 'coast_guard', name: 'Coast Guard', icon: 'water' },
  { id: 'space_force', name: 'Space Force', icon: 'planet' },
];

// Status options
const STATUS_OPTIONS: { id: MilitaryStatus; name: string; desc: string }[] = [
  { id: 'active_duty', name: 'Active Duty', desc: 'Full-time military service' },
  { id: 'national_guard', name: 'National Guard', desc: 'Army or Air National Guard' },
  { id: 'reserve', name: 'Reserve', desc: 'Reserve component drilling' },
];

// Guard/Reserve title options
const TITLE_OPTIONS: { id: GuardReserveTitle; name: string; desc: string }[] = [
  { id: 'title_10', name: 'Title 10', desc: 'Federal active duty orders' },
  { id: 'title_32_ados', name: 'Title 32 ADOS', desc: 'Active Duty Operational Support' },
  { id: 'title_32_agr', name: 'AGR', desc: 'Active Guard/Reserve (full-time)' },
  { id: 'm_day', name: 'M-Day/Drilling', desc: 'Traditional drilling member' },
];

// Orders type options
const ORDERS_OPTIONS: { id: OrdersType; name: string; desc: string }[] = [
  { id: 'none', name: 'None', desc: 'At home station' },
  { id: 'tdy', name: 'TDY', desc: 'Temporary Duty' },
  { id: 'tcs', name: 'TCS', desc: 'Temporary Change of Station' },
  { id: 'pcs', name: 'PCS', desc: 'Permanent Change of Station' },
];

// Ranks by category
const ENLISTED_RANKS: PayGrade[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'];
const WARRANT_RANKS: PayGrade[] = ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'];
const OFFICER_RANKS: PayGrade[] = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { register, isLoading, error, clearError } = useAuth();

  // Current step
  const [currentStep, setCurrentStep] = useState<Step>('credentials');

  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Military profile state
  const [branch, setBranch] = useState<MilitaryBranch | null>(null);
  const [payGrade, setPayGrade] = useState<PayGrade | null>(null);
  const [status, setStatus] = useState<MilitaryStatus>('active_duty');
  const [guardReserveTitle, setGuardReserveTitle] = useState<GuardReserveTitle | null>(null);
  const [baseEntryDate, setBaseEntryDate] = useState('');
  const [etsDate, setEtsDate] = useState('');
  const [ordersType, setOrdersType] = useState<OrdersType>('none');
  const [ordersZipCode, setOrdersZipCode] = useState('');
  const [milEmail, setMilEmail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current step index
  const stepIndex = STEPS.indexOf(currentStep);

  // Get background based on selected branch
  const getStepBackground = () => {
    if (!branch) return null;

    // Map branch IDs to background keys
    const branchToBackground: Record<MilitaryBranch, keyof typeof backgrounds> = {
      army: 'army',
      navy: 'navy',
      air_force: 'airForce',
      marine_corps: 'marines',
      coast_guard: 'coastGuard',
      space_force: 'spaceForce',
    };

    const bgKey = branchToBackground[branch];
    return bgKey ? backgrounds[bgKey] : null;
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'credentials') {
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
    } else if (currentStep === 'branch') {
      if (!branch) {
        newErrors.branch = 'Please select your branch of service';
      }
    } else if (currentStep === 'rank') {
      if (!payGrade) {
        newErrors.payGrade = 'Please select your pay grade';
      }
    } else if (currentStep === 'dates') {
      if (!baseEntryDate) {
        newErrors.baseEntryDate = 'Base Entry Date is required';
      }
      if (!etsDate) {
        newErrors.etsDate = 'ETS Date is required';
      }
    } else if (currentStep === 'status') {
      if ((status === 'national_guard' || status === 'reserve') && !guardReserveTitle) {
        newErrors.title = 'Please select your title status';
      }
    } else if (currentStep === 'location') {
      if (ordersType !== 'none' && !ordersZipCode) {
        newErrors.zipCode = 'ZIP code is required for orders';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateStep()) return;

    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    } else {
      // Final step - complete registration
      await handleRegister();
    }
  };

  // Handle back
  const handleBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1]);
    } else {
      router.back();
    }
  };

  // Complete registration
  const handleRegister = async () => {
    clearError();

    const success = await register(email, password, undefined, {
      branch: branch!,
      payGrade: payGrade!,
      status,
      guardReserveTitle: (status === 'national_guard' || status === 'reserve') ? guardReserveTitle || undefined : undefined,
      baseEntryDate,
      etsDate,
      ordersType,
      ordersZipCode: ordersType !== 'none' ? ordersZipCode : undefined,
      milEmail: milEmail || undefined,
    });

    if (success) {
      router.replace('/(tabs)/dashboard');
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'credentials':
        return renderCredentialsStep();
      case 'branch':
        return renderBranchStep();
      case 'rank':
        return renderRankStep();
      case 'dates':
        return renderDatesStep();
      case 'status':
        return renderStatusStep();
      case 'location':
        return renderLocationStep();
      default:
        return null;
    }
  };

  // Step 1: Credentials
  const renderCredentialsStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Create Your Account
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Secure your military financial data
      </Text>

      <GlassCard style={styles.formCard}>
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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          }
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

        <View style={styles.passwordHints}>
          <PasswordHint met={password.length >= 8} text="At least 8 characters" />
          <PasswordHint met={/[A-Za-z]/.test(password)} text="At least one letter" />
          <PasswordHint met={/[0-9]/.test(password)} text="At least one number" />
        </View>
      </GlassCard>
    </>
  );

  // Step 2: Branch Selection
  const renderBranchStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Branch of Service
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Select your military branch
      </Text>

      <View style={styles.branchGrid}>
        {BRANCHES.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.branchCard,
              branch === b.id && styles.branchCardSelected,
            ]}
            onPress={() => setBranch(b.id)}
          >
            <GlassCard
              style={styles.branchCardInner}
              intensity={branch === b.id ? 80 : 40}
              borderColor={branch === b.id ? theme.colors.primary : undefined}
            >
              <Ionicons
                name={b.icon as keyof typeof Ionicons.glyphMap}
                size={32}
                color={branch === b.id ? theme.colors.primary : theme.colors.text}
              />
              <Text
                style={[
                  styles.branchName,
                  { color: branch === b.id ? theme.colors.primary : theme.colors.text },
                ]}
              >
                {b.name}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
      {errors.branch && (
        <Text style={styles.errorText}>{errors.branch}</Text>
      )}
    </>
  );

  // Step 3: Rank Selection
  const renderRankStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Pay Grade
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Select your current rank
      </Text>

      <GlassCard style={styles.formCard}>
        <Text style={[styles.rankCategory, { color: theme.colors.text }]}>
          Enlisted
        </Text>
        <View style={styles.rankGrid}>
          {ENLISTED_RANKS.map((rank) => (
            <TouchableOpacity
              key={rank}
              style={[
                styles.rankButton,
                {
                  backgroundColor: payGrade === rank ? theme.colors.primary : 'transparent',
                  borderColor: payGrade === rank ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setPayGrade(rank)}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: payGrade === rank ? '#fff' : theme.colors.text },
                ]}
              >
                {rank}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.rankCategory, { color: theme.colors.text }]}>
          Warrant Officer
        </Text>
        <View style={styles.rankGrid}>
          {WARRANT_RANKS.map((rank) => (
            <TouchableOpacity
              key={rank}
              style={[
                styles.rankButton,
                {
                  backgroundColor: payGrade === rank ? theme.colors.primary : 'transparent',
                  borderColor: payGrade === rank ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setPayGrade(rank)}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: payGrade === rank ? '#fff' : theme.colors.text },
                ]}
              >
                {rank}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.rankCategory, { color: theme.colors.text }]}>
          Officer
        </Text>
        <View style={styles.rankGrid}>
          {OFFICER_RANKS.map((rank) => (
            <TouchableOpacity
              key={rank}
              style={[
                styles.rankButton,
                {
                  backgroundColor: payGrade === rank ? theme.colors.primary : 'transparent',
                  borderColor: payGrade === rank ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setPayGrade(rank)}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: payGrade === rank ? '#fff' : theme.colors.text },
                ]}
              >
                {rank}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>
      {errors.payGrade && (
        <Text style={styles.errorText}>{errors.payGrade}</Text>
      )}
    </>
  );

  // Step 4: Service Dates
  const renderDatesStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Service Dates
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Enter your key service dates
      </Text>

      <GlassCard style={styles.formCard}>
        <Input
          label="Base Entry Date (BASD)"
          placeholder="YYYY-MM-DD"
          value={baseEntryDate}
          onChangeText={(text) => {
            setBaseEntryDate(text);
            if (errors.baseEntryDate) setErrors({ ...errors, baseEntryDate: '' });
          }}
          error={errors.baseEntryDate}
        />

        <Input
          label="Expiration Term of Service (ETS)"
          placeholder="YYYY-MM-DD"
          value={etsDate}
          onChangeText={(text) => {
            setEtsDate(text);
            if (errors.etsDate) setErrors({ ...errors, etsDate: '' });
          }}
          error={errors.etsDate}
        />

        <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            BASD is used to calculate your years of service and pay adjustments.
          </Text>
        </View>
      </GlassCard>
    </>
  );

  // Step 5: Duty Status
  const renderStatusStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Duty Status
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Select your current status
      </Text>

      <View style={styles.statusList}>
        {STATUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              setStatus(option.id);
              if (option.id === 'active_duty') {
                setGuardReserveTitle(null);
              }
            }}
          >
            <GlassCard
              style={styles.statusCard}
              borderColor={status === option.id ? theme.colors.primary : undefined}
            >
              <View style={styles.radioOuter}>
                {status === option.id && (
                  <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusName, { color: theme.colors.text }]}>
                  {option.name}
                </Text>
                <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
                  {option.desc}
                </Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>

      {(status === 'national_guard' || status === 'reserve') && (
        <>
          <Text style={[styles.subSectionTitle, { color: theme.colors.text }]}>
            Title Status
          </Text>
          <View style={styles.titleGrid}>
            {TITLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.titleButton,
                  {
                    backgroundColor: guardReserveTitle === option.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: guardReserveTitle === option.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setGuardReserveTitle(option.id)}
              >
                <Text
                  style={[
                    styles.titleButtonText,
                    { color: guardReserveTitle === option.id ? '#fff' : theme.colors.text },
                  ]}
                >
                  {option.name}
                </Text>
                <Text
                  style={[
                    styles.titleButtonDesc,
                    { color: guardReserveTitle === option.id ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {option.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </>
      )}
    </>
  );

  // Step 6: Location/Orders
  const renderLocationStep = () => (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Orders & Location
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Current orders status
      </Text>

      <View style={styles.ordersGrid}>
        {ORDERS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.ordersButton,
              {
                backgroundColor: ordersType === option.id ? theme.colors.primary : 'transparent',
                borderColor: ordersType === option.id ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setOrdersType(option.id)}
          >
            <Text
              style={[
                styles.ordersButtonText,
                { color: ordersType === option.id ? '#fff' : theme.colors.text },
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {ordersType !== 'none' && (
        <GlassCard style={styles.formCard}>
          <Input
            label={`${ordersType.toUpperCase()} Location ZIP Code`}
            placeholder="Enter ZIP code"
            value={ordersZipCode}
            onChangeText={(text) => {
              setOrdersZipCode(text);
              if (errors.zipCode) setErrors({ ...errors, zipCode: '' });
            }}
            keyboardType="numeric"
            maxLength={5}
            error={errors.zipCode}
          />
        </GlassCard>
      )}

      <GlassCard style={styles.formCardWithMargin}>
        <Input
          label=".mil Email (Optional)"
          placeholder="firstname.lastname@mail.mil"
          value={milEmail}
          onChangeText={setMilEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.optionalNote, { color: theme.colors.textSecondary }]}>
          Used for verification and official communications
        </Text>
      </GlassCard>
    </>
  );

  // Password hint component
  const PasswordHint = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.passwordHint}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? theme.colors.income : theme.colors.textSecondary}
      />
      <Text style={[styles.passwordHintText, { color: met ? theme.colors.income : theme.colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );

  // Render background
  const bgImage = getStepBackground();

  return (
    <View style={styles.container}>
      {bgImage ? (
        <ImageBackground source={bgImage} style={styles.backgroundImage} resizeMode="cover">
          <View style={[styles.overlay, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]}>
            {renderContent()}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {renderContent()}
        </View>
      )}
    </View>
  );

  function renderContent() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              {STEPS.map((step, index) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index <= stepIndex ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.placeholder} />
          </View>

          {/* Step content */}
          <View style={styles.content}>
            {renderStepContent()}
          </View>

          {/* Error message */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Continue button */}
          <Button
            title={stepIndex === STEPS.length - 1 ? 'Create Account' : 'Continue'}
            onPress={handleNext}
            loading={isLoading}
            fullWidth
            style={styles.continueButton}
          />

          {/* Footer */}
          {currentStep === 'credentials' && (
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
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: 24,
  },
  formCard: {
    marginBottom: spacing.md,
  },
  formCardWithMargin: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  passwordHints: {
    marginTop: spacing.sm,
    gap: 4,
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordHintText: {
    fontSize: typography.fontSize.sm,
  },

  // Branch grid
  branchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  branchCard: {
    width: '48%',
  },
  branchCardSelected: {},
  branchCardInner: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  branchName: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Rank grid
  rankCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rankButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  rankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Status list
  statusList: {
    gap: spacing.sm,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusInfo: {},
  statusName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  statusDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Title grid
  subSectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  titleButton: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  titleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  titleButtonDesc: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Orders grid
  ordersGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ordersButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  ordersButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  optionalNote: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },

  errorText: {
    color: '#f44336',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.lg,
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
