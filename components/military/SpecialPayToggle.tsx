// Special Pay Toggle component - toggle special pays with info tooltips

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../../hooks';
import { SpecialPayType, SpecialPayQualification } from '../../types';
import { typography, borderRadius, spacing } from '../../constants/theme';

interface SpecialPayInfo {
  type: SpecialPayType;
  name: string;
  shortName: string;
  monthlyAmount: number | string; // string for variable amounts
  isTaxFree: boolean;
  description: string;
  eligibility: string;
  certification?: string;
}

const SPECIAL_PAY_INFO: SpecialPayInfo[] = [
  {
    type: 'hostile_fire_imminent_danger',
    name: 'Hostile Fire / Imminent Danger Pay',
    shortName: 'HFP/IDP',
    monthlyAmount: 225,
    isTaxFree: true,
    description: 'Combat pay for duty in designated danger areas.',
    eligibility: 'Serving in an officially designated imminent danger zone or combat area.',
    certification: 'Deployment orders to designated area',
  },
  {
    type: 'hardship_duty_location',
    name: 'Hardship Duty Pay - Location',
    shortName: 'HDP-L',
    monthlyAmount: '$50-$150',
    isTaxFree: false,
    description: 'Pay for locations with exceptionally hardship conditions.',
    eligibility: 'Assigned to a designated hardship location for 30+ days.',
    certification: 'Orders to designated location',
  },
  {
    type: 'family_separation',
    name: 'Family Separation Allowance',
    shortName: 'FSA',
    monthlyAmount: 250,
    isTaxFree: true,
    description: 'Allowance for involuntary separation from dependents.',
    eligibility: 'Forced to live away from family for 30+ continuous days due to military orders.',
    certification: 'Deployment orders or unaccompanied tour orders',
  },
  {
    type: 'flight_pay_acip',
    name: 'Aviation Career Incentive Pay',
    shortName: 'ACIP',
    monthlyAmount: '$125-$1000',
    isTaxFree: false,
    description: 'Incentive pay for rated pilots and navigators.',
    eligibility: 'Rated officer or warrant officer on flying status.',
    certification: 'Aviation rating and flight orders',
  },
  {
    type: 'flight_pay_cefip',
    name: 'Career Enlisted Flyer Incentive Pay',
    shortName: 'CEFIP',
    monthlyAmount: '$150-$400',
    isTaxFree: false,
    description: 'Incentive pay for enlisted aircrew.',
    eligibility: 'Enlisted member on flying status as primary duty.',
    certification: 'Aircrew orders',
  },
  {
    type: 'sea_pay',
    name: 'Career Sea Pay',
    shortName: 'Sea Pay',
    monthlyAmount: '$50-$750',
    isTaxFree: false,
    description: 'Pay for lengthy sea assignments.',
    eligibility: 'Assigned to a ship at sea for 30+ consecutive days.',
    certification: 'Ship assignment orders',
  },
  {
    type: 'submarine_pay',
    name: 'Submarine Duty Pay',
    shortName: 'Sub Pay',
    monthlyAmount: '$75-$835',
    isTaxFree: false,
    description: 'Incentive pay for submarine service.',
    eligibility: 'Qualified submariner assigned to submarine duty.',
    certification: 'Submarine qualification and orders',
  },
  {
    type: 'jump_pay',
    name: 'Parachute Duty Pay',
    shortName: 'Jump Pay',
    monthlyAmount: 150,
    isTaxFree: false,
    description: 'Pay for qualified parachutists on jump status.',
    eligibility: 'Must be qualified parachutist and perform at least one jump per 3 months.',
    certification: 'Airborne qualification and jump status orders',
  },
  {
    type: 'jump_pay_halo',
    name: 'HALO/Military Free Fall Pay',
    shortName: 'HALO Pay',
    monthlyAmount: 225,
    isTaxFree: false,
    description: 'Pay for military free-fall qualified jumpers.',
    eligibility: 'HALO/MFF qualified and on jump status.',
    certification: 'MFF qualification and orders',
  },
  {
    type: 'dive_pay',
    name: 'Diving Duty Pay',
    shortName: 'Dive Pay',
    monthlyAmount: '$150-$340',
    isTaxFree: false,
    description: 'Pay for certified divers on diving assignments.',
    eligibility: 'Certified military diver on diving duty.',
    certification: 'Dive certification and diving orders',
  },
  {
    type: 'foreign_language',
    name: 'Foreign Language Proficiency Pay',
    shortName: 'FLPB',
    monthlyAmount: '$100-$1000',
    isTaxFree: false,
    description: 'Pay for demonstrated foreign language skills.',
    eligibility: 'Must test proficient in a designated strategic language.',
    certification: 'DLPT scores in needed language',
  },
  {
    type: 'special_duty_assignment',
    name: 'Special Duty Assignment Pay',
    shortName: 'SDAP',
    monthlyAmount: '$75-$450',
    isTaxFree: false,
    description: 'Pay for extremely demanding duty positions.',
    eligibility: 'Enlisted in designated SDAP billet (recruiters, drill sergeants, etc.).',
    certification: 'Orders to SDAP billet',
  },
];

interface SpecialPayToggleProps {
  qualifications: SpecialPayQualification[];
  onToggle: (payType: SpecialPayType, isActive: boolean, amount?: number) => void;
  onRemove: (payType: SpecialPayType) => void;
}

export function SpecialPayToggle({
  qualifications,
  onToggle,
  onRemove,
}: SpecialPayToggleProps) {
  const theme = useTheme();
  const [expandedPay, setExpandedPay] = useState<SpecialPayType | null>(null);

  const getQualification = (payType: SpecialPayType): SpecialPayQualification | undefined => {
    return qualifications.find((q) => q.payType === payType);
  };

  const renderPayItem = (info: SpecialPayInfo) => {
    const qualification = getQualification(info.type);
    const isActive = qualification?.isActive ?? false;
    const isExpanded = expandedPay === info.type;

    return (
      <View
        key={info.type}
        style={[
          styles.payItem,
          {
            backgroundColor: isActive ? theme.colors.primary + '10' : theme.colors.card,
            borderColor: isActive ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        {/* Header Row */}
        <TouchableOpacity
          style={styles.payHeader}
          onPress={() => setExpandedPay(isExpanded ? null : info.type)}
        >
          <View style={styles.payInfo}>
            <Text style={[styles.payName, { color: theme.colors.text }]}>
              {info.shortName}
            </Text>
            <Text style={[styles.payAmount, { color: theme.colors.textSecondary }]}>
              {typeof info.monthlyAmount === 'number'
                ? `$${info.monthlyAmount}/mo`
                : info.monthlyAmount}
              {info.isTaxFree && (
                <Text style={{ color: theme.colors.income }}> (Tax-free)</Text>
              )}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={(value) => {
              const amount = typeof info.monthlyAmount === 'number' ? info.monthlyAmount : 0;
              onToggle(info.type, value, amount);
            }}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={isActive ? theme.colors.primary : theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.payDetails}>
            <Text style={[styles.payFullName, { color: theme.colors.text }]}>
              {info.name}
            </Text>
            <Text style={[styles.payDescription, { color: theme.colors.textSecondary }]}>
              {info.description}
            </Text>

            <View style={styles.eligibilityBox}>
              <Text style={[styles.eligibilityLabel, { color: theme.colors.primary }]}>
                Eligibility
              </Text>
              <Text style={[styles.eligibilityText, { color: theme.colors.text }]}>
                {info.eligibility}
              </Text>
            </View>

            {info.certification && (
              <View style={styles.certBox}>
                <Text style={[styles.certLabel, { color: theme.colors.textSecondary }]}>
                  Required Documentation
                </Text>
                <Text style={[styles.certText, { color: theme.colors.text }]}>
                  {info.certification}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Special & Incentive Pays
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Toggle any special pays you currently receive. Tap to see eligibility requirements.
      </Text>

      <View style={styles.payList}>
        {SPECIAL_PAY_INFO.map(renderPayItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  payList: {
    gap: spacing.sm,
  },
  payItem: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  payInfo: {
    flex: 1,
  },
  payName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  payAmount: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  payDetails: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  payFullName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  payDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  eligibilityBox: {
    marginBottom: spacing.sm,
  },
  eligibilityLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  eligibilityText: {
    fontSize: typography.fontSize.sm,
  },
  certBox: {
    marginTop: spacing.sm,
  },
  certLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  certText: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
});
