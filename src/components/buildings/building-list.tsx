'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { SearchBar } from './search-bar';
import { BuildingCard } from './building-card';
import { useDebounce } from '@/hooks/use-debounce';
import { getBuildings } from '@/actions/buildings';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import type { Building } from '@/lib/supabase/types';

interface BuildingListProps {
  initialBuildings: Building[];
}

interface RegionConfig {
  prefixes: string[];
  color: string;
  label: string;
}

const REGIONS: RegionConfig[] = [
  { prefixes: ['용강', '용황'], color: 'bg-region-yonggang', label: '용강/용황' },
  { prefixes: ['동천'], color: 'bg-region-dongcheon', label: '동천' },
  { prefixes: ['황성'], color: 'bg-region-hwangseong', label: '황성' },
  { prefixes: ['경주'], color: 'bg-region-gyeongju', label: '경주' },
  { prefixes: ['엑스포', 'APEC'], color: 'bg-region-expo', label: '엑스포/APEC' },
];

const ETC_REGION: RegionConfig = { prefixes: [], color: 'bg-region-etc', label: '기타' };

function getRegionConfig(building: Building): RegionConfig {
  const text = `${building.address ?? ''} ${building.name ?? ''}`;
  for (const region of REGIONS) {
    if (region.prefixes.some((p) => text.includes(p))) return region;
  }
  return ETC_REGION;
}

function groupBuildings(buildings: Building[]): [RegionConfig, Building[]][] {
  const groups = new Map<string, { config: RegionConfig; items: Building[] }>();

  for (const building of buildings) {
    const config = getRegionConfig(building);
    if (!groups.has(config.label)) groups.set(config.label, { config, items: [] });
    groups.get(config.label)!.items.push(building);
  }

  const order = [...REGIONS.map((r) => r.label), ETC_REGION.label];
  return Array.from(groups.values())
    .sort((a, b) => order.indexOf(a.config.label) - order.indexOf(b.config.label))
    .map(({ config, items }) => [config, items]);
}

export function BuildingList({ initialBuildings }: BuildingListProps) {
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState(initialBuildings);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    startTransition(async () => {
      const results = await getBuildings(debouncedSearch || undefined);
      setBuildings(results);
    });
  }, [debouncedSearch]);

  const grouped = useMemo(() => groupBuildings(buildings), [buildings]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <SearchBar value={search} onChange={setSearch} />

      {isPending ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-gray-400">
            {search ? '검색 결과가 없습니다' : '등록된 건물이 없습니다'}
          </p>
        </div>
      ) : search ? (
        <div className="flex flex-col gap-2">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} regionConfig={getRegionConfig(building)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([config, items]) => (
            <section key={config.label}>
              <div className="sticky top-[52px] z-[5] mb-2 flex items-center gap-2 bg-gray-100 px-1 py-1">
                <div className={`h-4 w-1 rounded-full ${config.color}`} />
                <h2 className="text-sm font-bold text-gray-500">
                  {config.label}
                </h2>
                <span className="text-xs font-semibold text-gray-400">{items.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((building) => (
                  <BuildingCard key={building.id} building={building} regionConfig={config} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
