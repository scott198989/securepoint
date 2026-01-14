// Military pay calculation hook

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  calculateMilitaryPay,
  calculateDrillPay,
  getVADisabilityCompensation,
  calculateRetirementPay,
  PayEstimate,
} from '../utils/calculations/militaryPay';
import { PayGrade } from '../types';

interface UseMilitaryPayReturn {
  payEstimate: PayEstimate | null;
  drillPay: number;
  vaCompensation: number;
  retirementEstimate: number;
  calculatePay: (
    mhaCode?: string,
    hasDependents?: boolean,
    specialPays?: string[]
  ) => PayEstimate;
}

export function useMilitaryPay(): UseMilitaryPayReturn {
  const { user } = useAuth();
  const profile = user?.militaryProfile;

  const payEstimate = useMemo(() => {
    if (!profile || !profile.payGrade) return null;
    return calculateMilitaryPay(profile);
  }, [profile]);

  const drillPay = useMemo(() => {
    if (!profile?.payGrade) return 0;
    return calculateDrillPay(
      profile.payGrade as PayGrade,
      profile.yearsOfService || 0
    );
  }, [profile]);

  const vaCompensation = useMemo(() => {
    if (!profile?.vaDisabilityRating) return 0;
    return getVADisabilityCompensation(profile.vaDisabilityRating);
  }, [profile?.vaDisabilityRating]);

  const retirementEstimate = useMemo(() => {
    if (!profile?.payGrade || !profile.yearsOfService) return 0;
    return calculateRetirementPay(
      profile.payGrade as PayGrade,
      profile.yearsOfService
    );
  }, [profile]);

  const calculatePay = (
    mhaCode?: string,
    hasDependents: boolean = false,
    specialPays: string[] = []
  ): PayEstimate => {
    if (!profile) {
      return {
        basePay: 0,
        bah: 0,
        bas: 0,
        specialPays: [],
        totalGross: 0,
        taxableIncome: 0,
        taxFreeIncome: 0,
      };
    }
    return calculateMilitaryPay(profile, mhaCode, hasDependents, specialPays);
  };

  return {
    payEstimate,
    drillPay,
    vaCompensation,
    retirementEstimate,
    calculatePay,
  };
}
