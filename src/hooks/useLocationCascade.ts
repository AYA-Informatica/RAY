"use client";

import { useEffect, useState } from "react";
import { PROVINCE_TO_CITY } from "@/constants/locations";

export interface DistrictRow {
  district: string;
  province: string;
}

interface UseLocationCascadeResult {
  allDistricts: DistrictRow[];
  loadingDistricts: boolean;
  sectors: string[];
  loadingSectors: boolean;
  cityFromDistrict: (districtName: string) => string;
}

/**
 * Loads the Rwanda district list once on mount, then loads sectors
 * whenever `district` changes. Both fetches hit the /api/location/* routes
 * which are publicly cached for 24 h.
 *
 * @param district  - currently selected district name (from draft/form state)
 * @param onSectorsLoaded - optional callback fired each time sectors resolve,
 *   useful for GPS auto-matching (e.g. SellWizard's sectorCandidatesRef).
 */
export function useLocationCascade(
  district: string,
  onSectorsLoaded?: (sectors: string[]) => void,
): UseLocationCascadeResult {
  const [allDistricts, setAllDistricts] = useState<DistrictRow[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [sectors, setSectors] = useState<string[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  useEffect(() => {
    fetch("/api/location/districts")
      .then((r) => r.json())
      .then((j: { data: DistrictRow[] }) => setAllDistricts(j.data))
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, []);

  useEffect(() => {
    if (!district) {
      setSectors([]);
      return;
    }
    setLoadingSectors(true);
    fetch(`/api/location/sectors?district=${encodeURIComponent(district)}`)
      .then((r) => r.json())
      .then((j: { data: string[] }) => {
        setSectors(j.data);
        onSectorsLoaded?.(j.data);
      })
      .catch(() => setSectors([]))
      .finally(() => setLoadingSectors(false));
    // onSectorsLoaded is intentionally omitted — it's a callback ref pattern,
    // callers should wrap it in useCallback if they need stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  const cityFromDistrict = (districtName: string): string => {
    const row = allDistricts.find((d) => d.district === districtName);
    if (!row) return districtName;
    return PROVINCE_TO_CITY[row.province] ?? row.province;
  };

  return { allDistricts, loadingDistricts, sectors, loadingSectors, cityFromDistrict };
}
