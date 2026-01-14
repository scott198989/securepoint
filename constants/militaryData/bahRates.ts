// BAH (Basic Allowance for Housing) Rate Structure
// Note: Actual BAH rates are location-specific and updated annually
// This file provides the structure and sample data; full data would be loaded from API

import { PayGrade } from '../../types';

export interface BAHRateEntry {
  mha: string; // Military Housing Area code
  mhaName: string;
  state: string;
  zipCodes: string[];
  rates: {
    payGrade: PayGrade;
    withDependents: number;
    withoutDependents: number;
  }[];
}

// Sample BAH rates for major military areas (2024)
// Full dataset would be much larger
export const SAMPLE_BAH_RATES: BAHRateEntry[] = [
  {
    mha: 'VA322',
    mhaName: 'Norfolk-Virginia Beach-Newport News',
    state: 'VA',
    zipCodes: ['23502', '23503', '23504', '23505', '23507', '23508', '23509', '23510', '23511'],
    rates: [
      { payGrade: 'E-1', withDependents: 1845, withoutDependents: 1470 },
      { payGrade: 'E-2', withDependents: 1845, withoutDependents: 1470 },
      { payGrade: 'E-3', withDependents: 1845, withoutDependents: 1470 },
      { payGrade: 'E-4', withDependents: 1845, withoutDependents: 1470 },
      { payGrade: 'E-5', withDependents: 1914, withoutDependents: 1581 },
      { payGrade: 'E-6', withDependents: 2049, withoutDependents: 1695 },
      { payGrade: 'E-7', withDependents: 2148, withoutDependents: 1785 },
      { payGrade: 'E-8', withDependents: 2286, withoutDependents: 1917 },
      { payGrade: 'E-9', withDependents: 2385, withoutDependents: 2004 },
      { payGrade: 'O-1', withDependents: 1941, withoutDependents: 1611 },
      { payGrade: 'O-2', withDependents: 2049, withoutDependents: 1695 },
      { payGrade: 'O-3', withDependents: 2229, withoutDependents: 1875 },
      { payGrade: 'O-4', withDependents: 2433, withoutDependents: 2061 },
      { payGrade: 'O-5', withDependents: 2556, withoutDependents: 2184 },
      { payGrade: 'O-6', withDependents: 2652, withoutDependents: 2277 },
    ],
  },
  {
    mha: 'CA371',
    mhaName: 'San Diego',
    state: 'CA',
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109'],
    rates: [
      { payGrade: 'E-1', withDependents: 2871, withoutDependents: 2226 },
      { payGrade: 'E-2', withDependents: 2871, withoutDependents: 2226 },
      { payGrade: 'E-3', withDependents: 2871, withoutDependents: 2226 },
      { payGrade: 'E-4', withDependents: 2871, withoutDependents: 2226 },
      { payGrade: 'E-5', withDependents: 3003, withoutDependents: 2385 },
      { payGrade: 'E-6', withDependents: 3192, withoutDependents: 2589 },
      { payGrade: 'E-7', withDependents: 3345, withoutDependents: 2739 },
      { payGrade: 'E-8', withDependents: 3561, withoutDependents: 2913 },
      { payGrade: 'E-9', withDependents: 3729, withoutDependents: 3063 },
      { payGrade: 'O-1', withDependents: 3063, withoutDependents: 2478 },
      { payGrade: 'O-2', withDependents: 3192, withoutDependents: 2589 },
      { payGrade: 'O-3', withDependents: 3477, withoutDependents: 2841 },
      { payGrade: 'O-4', withDependents: 3798, withoutDependents: 3126 },
      { payGrade: 'O-5', withDependents: 3996, withoutDependents: 3291 },
      { payGrade: 'O-6', withDependents: 4134, withoutDependents: 3414 },
    ],
  },
  {
    mha: 'TX328',
    mhaName: 'San Antonio',
    state: 'TX',
    zipCodes: ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209'],
    rates: [
      { payGrade: 'E-1', withDependents: 1623, withoutDependents: 1287 },
      { payGrade: 'E-2', withDependents: 1623, withoutDependents: 1287 },
      { payGrade: 'E-3', withDependents: 1623, withoutDependents: 1287 },
      { payGrade: 'E-4', withDependents: 1623, withoutDependents: 1287 },
      { payGrade: 'E-5', withDependents: 1689, withoutDependents: 1377 },
      { payGrade: 'E-6', withDependents: 1800, withoutDependents: 1479 },
      { payGrade: 'E-7', withDependents: 1881, withoutDependents: 1548 },
      { payGrade: 'E-8', withDependents: 2007, withoutDependents: 1656 },
      { payGrade: 'E-9', withDependents: 2106, withoutDependents: 1740 },
      { payGrade: 'O-1', withDependents: 1713, withoutDependents: 1404 },
      { payGrade: 'O-2', withDependents: 1800, withoutDependents: 1479 },
      { payGrade: 'O-3', withDependents: 1956, withoutDependents: 1620 },
      { payGrade: 'O-4', withDependents: 2145, withoutDependents: 1782 },
      { payGrade: 'O-5', withDependents: 2250, withoutDependents: 1872 },
      { payGrade: 'O-6', withDependents: 2334, withoutDependents: 1950 },
    ],
  },
  {
    mha: 'NC324',
    mhaName: 'Fayetteville',
    state: 'NC',
    zipCodes: ['28301', '28302', '28303', '28304', '28305', '28306', '28307', '28308', '28309'],
    rates: [
      { payGrade: 'E-1', withDependents: 1275, withoutDependents: 1044 },
      { payGrade: 'E-2', withDependents: 1275, withoutDependents: 1044 },
      { payGrade: 'E-3', withDependents: 1275, withoutDependents: 1044 },
      { payGrade: 'E-4', withDependents: 1275, withoutDependents: 1044 },
      { payGrade: 'E-5', withDependents: 1326, withoutDependents: 1101 },
      { payGrade: 'E-6', withDependents: 1422, withoutDependents: 1179 },
      { payGrade: 'E-7', withDependents: 1479, withoutDependents: 1233 },
      { payGrade: 'E-8', withDependents: 1581, withoutDependents: 1317 },
      { payGrade: 'E-9', withDependents: 1656, withoutDependents: 1380 },
      { payGrade: 'O-1', withDependents: 1353, withoutDependents: 1122 },
      { payGrade: 'O-2', withDependents: 1422, withoutDependents: 1179 },
      { payGrade: 'O-3', withDependents: 1545, withoutDependents: 1287 },
      { payGrade: 'O-4', withDependents: 1692, withoutDependents: 1416 },
      { payGrade: 'O-5', withDependents: 1776, withoutDependents: 1485 },
      { payGrade: 'O-6', withDependents: 1845, withoutDependents: 1545 },
    ],
  },
];

// Get BAH rate for a location and pay grade
export function getBAHRate(
  mhaCode: string,
  payGrade: PayGrade,
  withDependents: boolean
): number | null {
  const area = SAMPLE_BAH_RATES.find(a => a.mha === mhaCode);
  if (!area) return null;

  const rate = area.rates.find(r => r.payGrade === payGrade);
  if (!rate) return null;

  return withDependents ? rate.withDependents : rate.withoutDependents;
}

// Find MHA by zip code
export function findMHAByZip(zipCode: string): BAHRateEntry | null {
  return SAMPLE_BAH_RATES.find(area => area.zipCodes.includes(zipCode)) || null;
}

// Get all available MHAs
export function getAllMHAs(): { mha: string; name: string; state: string }[] {
  return SAMPLE_BAH_RATES.map(area => ({
    mha: area.mha,
    name: area.mhaName,
    state: area.state,
  }));
}
