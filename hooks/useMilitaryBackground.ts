// Hook to get the appropriate military background based on user profile

import { ImageSourcePropType } from 'react-native';
import { useAuth } from './useAuth';
import { getBackgroundForProfile } from '../assets/backgrounds';

interface UseMilitaryBackgroundReturn {
  background: ImageSourcePropType | null;
  hasBackground: boolean;
  branchName: string | null;
}

export function useMilitaryBackground(): UseMilitaryBackgroundReturn {
  const { user } = useAuth();

  const militaryProfile = user?.militaryProfile;
  const branch = militaryProfile?.branch;
  const status = militaryProfile?.status;

  const background = getBackgroundForProfile(branch, status);

  // Get human-readable branch name
  const getBranchName = (): string | null => {
    if (!branch) return null;

    const branchNames: Record<string, string> = {
      army: 'U.S. Army',
      navy: 'U.S. Navy',
      air_force: 'U.S. Air Force',
      marine_corps: 'U.S. Marine Corps',
      coast_guard: 'U.S. Coast Guard',
      space_force: 'U.S. Space Force',
    };

    const statusSuffix: Record<string, string> = {
      active_duty: '',
      national_guard: ' National Guard',
      reserve: ' Reserve',
      veteran: ' Veteran',
      retired: ' (Retired)',
    };

    const baseName = branchNames[branch] || branch;
    const suffix = status ? statusSuffix[status] || '' : '';

    // Special cases
    if (branch === 'army' && status === 'national_guard') {
      return 'Army National Guard';
    }
    if (branch === 'air_force' && status === 'national_guard') {
      return 'Air National Guard';
    }

    return `${baseName}${suffix}`;
  };

  return {
    background,
    hasBackground: background !== null,
    branchName: getBranchName(),
  };
}
