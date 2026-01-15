// Pay Grade Selector component - visual picker for E/W/O grades

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks';
import { PayGrade } from '../../types';
import { typography, borderRadius, spacing } from '../../constants/theme';

interface PayGradeSelectorProps {
  value?: PayGrade;
  onChange: (grade: PayGrade) => void;
  label?: string;
  error?: string;
}

type GradeType = 'enlisted' | 'warrant' | 'officer';

const ENLISTED_GRADES: PayGrade[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'];
const WARRANT_GRADES: PayGrade[] = ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'];
const OFFICER_GRADES: PayGrade[] = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'];

const GRADE_NAMES: Record<PayGrade, string> = {
  'E-1': 'E-1 (PVT/SR/AR)',
  'E-2': 'E-2 (PV2/SA/Amn)',
  'E-3': 'E-3 (PFC/SN/A1C)',
  'E-4': 'E-4 (SPC/PO3/SrA)',
  'E-5': 'E-5 (SGT/PO2/SSgt)',
  'E-6': 'E-6 (SSG/PO1/TSgt)',
  'E-7': 'E-7 (SFC/CPO/MSgt)',
  'E-8': 'E-8 (MSG/SCPO/SMSgt)',
  'E-9': 'E-9 (SGM/MCPO/CMSgt)',
  'W-1': 'W-1 (WO1)',
  'W-2': 'W-2 (CW2)',
  'W-3': 'W-3 (CW3)',
  'W-4': 'W-4 (CW4)',
  'W-5': 'W-5 (CW5)',
  'O-1': 'O-1 (2LT/ENS)',
  'O-2': 'O-2 (1LT/LTJG)',
  'O-3': 'O-3 (CPT/LT)',
  'O-4': 'O-4 (MAJ/LCDR)',
  'O-5': 'O-5 (LTC/CDR)',
  'O-6': 'O-6 (COL/CAPT)',
  'O-7': 'O-7 (BG/RDML)',
  'O-8': 'O-8 (MG/RADM)',
  'O-9': 'O-9 (LTG/VADM)',
  'O-10': 'O-10 (GEN/ADM)',
};

export function PayGradeSelector({
  value,
  onChange,
  label = 'Pay Grade',
  error,
}: PayGradeSelectorProps) {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<GradeType>(() => {
    if (!value) return 'enlisted';
    if (value.startsWith('E-')) return 'enlisted';
    if (value.startsWith('W-')) return 'warrant';
    return 'officer';
  });

  const getGradesForType = (type: GradeType): PayGrade[] => {
    switch (type) {
      case 'enlisted':
        return ENLISTED_GRADES;
      case 'warrant':
        return WARRANT_GRADES;
      case 'officer':
        return OFFICER_GRADES;
    }
  };

  const renderTypeTab = (type: GradeType, displayName: string) => {
    const isSelected = selectedType === type;
    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.typeTab,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => setSelectedType(type)}
      >
        <Text
          style={[
            styles.typeTabText,
            { color: isSelected ? '#fff' : theme.colors.text },
          ]}
        >
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGradeButton = (grade: PayGrade) => {
    const isSelected = value === grade;
    return (
      <TouchableOpacity
        key={grade}
        style={[
          styles.gradeButton,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => onChange(grade)}
      >
        <Text
          style={[
            styles.gradeButtonText,
            { color: isSelected ? '#fff' : theme.colors.text },
          ]}
        >
          {grade}
        </Text>
      </TouchableOpacity>
    );
  };

  const grades = getGradesForType(selectedType);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}

      {/* Type Tabs */}
      <View style={styles.typeTabs}>
        {renderTypeTab('enlisted', 'Enlisted')}
        {renderTypeTab('warrant', 'Warrant')}
        {renderTypeTab('officer', 'Officer')}
      </View>

      {/* Grade Grid */}
      <View style={styles.gradeGrid}>
        {grades.map(renderGradeButton)}
      </View>

      {/* Selected Grade Name */}
      {value && (
        <Text style={[styles.selectedName, { color: theme.colors.textSecondary }]}>
          {GRADE_NAMES[value]}
        </Text>
      )}

      {/* Error */}
      {error && (
        <Text style={[styles.error, { color: theme.colors.expense }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  typeTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gradeButton: {
    minWidth: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  gradeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  selectedName: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  error: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});
