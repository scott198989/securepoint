// Military branch background images
// These are used to personalize the app based on the user's military affiliation

// Active Duty
export const armyBackground = require('./army.png');
export const navyBackground = require('./navy.png');
export const airForceBackground = require('./air-force.png');
export const marinesBackground = require('./marines.png');
export const coastGuardBackground = require('./coast-guard.png');
export const spaceForceBackground = require('./space-force.png');

// National Guard
export const armyNationalGuardBackground = require('./army-national-guard.png');
export const airNationalGuardBackground = require('./air-national-guard.png');

// Reserve
export const armyReserveBackground = require('./army-reserve.png');
export const navyReserveBackground = require('./navy-reserve.png');
export const airForceReserveBackground = require('./air-force-reserve.png');
export const marinesReserveBackground = require('./marines-reserve.png');
export const coastGuardReserveBackground = require('./coast-guard-reserve.png');

// Veterans
export const veteranBackground = require('./veteran.png');

// Background mapping by branch and status
import { MilitaryBranch, MilitaryStatus } from '../../types';
import { ImageSourcePropType } from 'react-native';

type BackgroundKey = `${MilitaryBranch}_${MilitaryStatus}` | 'veteran' | 'default';

const backgroundMap: Record<string, ImageSourcePropType> = {
  // Army
  army_active_duty: armyBackground,
  army_national_guard: armyNationalGuardBackground,
  army_reserve: armyReserveBackground,

  // Navy
  navy_active_duty: navyBackground,
  navy_reserve: navyReserveBackground,

  // Air Force
  air_force_active_duty: airForceBackground,
  air_force_national_guard: airNationalGuardBackground,
  air_force_reserve: airForceReserveBackground,

  // Marine Corps
  marine_corps_active_duty: marinesBackground,
  marine_corps_reserve: marinesReserveBackground,

  // Coast Guard
  coast_guard_active_duty: coastGuardBackground,
  coast_guard_reserve: coastGuardReserveBackground,

  // Space Force (no reserve/guard components)
  space_force_active_duty: spaceForceBackground,

  // Veterans (used for all branches)
  veteran: veteranBackground,
};

export function getBackgroundForProfile(
  branch?: MilitaryBranch,
  status?: MilitaryStatus
): ImageSourcePropType | null {
  // If veteran or retired, use veteran background
  if (status === 'veteran' || status === 'retired') {
    return veteranBackground;
  }

  // If no branch or civilian/family member, return null (no background)
  if (!branch || status === 'civilian' || status === 'family_member') {
    return null;
  }

  // Build key and look up background
  const key = `${branch}_${status}`;
  return backgroundMap[key] || null;
}

// Export all backgrounds for direct access if needed
export const backgrounds = {
  army: armyBackground,
  navy: navyBackground,
  airForce: airForceBackground,
  marines: marinesBackground,
  coastGuard: coastGuardBackground,
  spaceForce: spaceForceBackground,
  armyNationalGuard: armyNationalGuardBackground,
  airNationalGuard: airNationalGuardBackground,
  armyReserve: armyReserveBackground,
  navyReserve: navyReserveBackground,
  airForceReserve: airForceReserveBackground,
  marinesReserve: marinesReserveBackground,
  coastGuardReserve: coastGuardReserveBackground,
  veteran: veteranBackground,
};
