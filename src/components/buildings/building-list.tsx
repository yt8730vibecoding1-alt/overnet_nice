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

interface DistrictDef {
  label: string;
  keywords: string[];
}

const DISTRICTS: DistrictDef[] = [
  { label: '동천동', keywords: ['동천동', '동천'] },
  { label: '황성동', keywords: ['황성동', '황성로', '황성'] },
  { label: '용강동', keywords: ['용강동', '용강로', '용강', '용황'] },
  { label: '보문동', keywords: ['보문동', '보문로', '보문', '신평동', '신평'] },
  { label: '선도동', keywords: ['선도동', '충효동', '충효'] },
  { label: '성건동', keywords: ['성건동', '성건'] },
  { label: '중부동', keywords: ['중부동', '중부'] },
  { label: '황남동', keywords: ['황남동', '황남'] },
  { label: '황오동', keywords: ['황오동', '황오'] },
  { label: '월성동', keywords: ['월성동', '월성'] },
  { label: '불국동', keywords: ['불국동', '불국', '진현동'] },
  { label: '보덕동', keywords: ['보덕동', '천군동', '천군', '경감로', '엑스포'] },
  { label: '안강읍', keywords: ['안강읍', '안강'] },
  { label: '건천읍', keywords: ['건천읍', '건천'] },
  { label: '외동읍', keywords: ['외동읍', '외동'] },
  { label: '감포읍', keywords: ['감포읍', '감포'] },
  { label: '강동면', keywords: ['강동면', '강동', '보불로'] },
  { label: '내남면', keywords: ['내남면', '내남'] },
  { label: '산내면', keywords: ['산내면', '산내'] },
  { label: '서면', keywords: ['서면'] },
  { label: '양남면', keywords: ['양남면', '양남'] },
  { label: '문무대왕면', keywords: ['문무대왕면', '문무대왕', '양북면', '양북'] },
  { label: '천북면', keywords: ['천북면', '천북'] },
  { label: '현곡면', keywords: ['현곡면', '현곡'] },
];

function getDistrict(building: Building): string {
  const addr = building.address;

  const parenMatch = addr.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parenContent = parenMatch[1];
    for (const district of DISTRICTS) {
      if (district.keywords.some((kw) => parenContent.includes(kw))) {
        return district.label;
      }
    }
  }

  for (const district of DISTRICTS) {
    if (district.keywords.some((kw) => addr.includes(kw))) {
      return district.label;
    }
  }

  return '기타';
}

function groupByDistrict(buildings: Building[]): [string, Building[]][] {
  const groups = new Map<string, Building[]>();

  for (const building of buildings) {
    const district = getDistrict(building);
    if (!groups.has(district)) groups.set(district, []);
    groups.get(district)!.push(building);
  }

  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === '기타') return 1;
    if (b[0] === '기타') return -1;
    return b[1].length - a[1].length;
  });
}

const CHIP_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', activeBg: 'bg-blue-500', activeText: 'text-white' },
  { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', activeBg: 'bg-emerald-500', activeText: 'text-white' },
  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', activeBg: 'bg-amber-500', activeText: 'text-white' },
  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', activeBg: 'bg-purple-500', activeText: 'text-white' },
  { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', activeBg: 'bg-rose-500', activeText: 'text-white' },
  { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', activeBg: 'bg-cyan-500', activeText: 'text-white' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', activeBg: 'bg-orange-500', activeText: 'text-white' },
  { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', activeBg: 'bg-teal-500', activeText: 'text-white' },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', activeBg: 'bg-indigo-500', activeText: 'text-white' },
  { bg: 'bg-lime-50', border: 'border-lime-300', text: 'text-lime-700', activeBg: 'bg-lime-500', activeText: 'text-white' },
];

export function BuildingList({ initialBuildings }: BuildingListProps) {
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState(initialBuildings);
  const [isPending, startTransition] = useTransition();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    startTransition(async () => {
      const results = await getBuildings(debouncedSearch || undefined);
      setBuildings(results);
    });
  }, [debouncedSearch]);

  const grouped = useMemo(() => groupByDistrict(buildings), [buildings]);

  // 선택된 동의 건물 목록
  const visibleBuildings = useMemo(() => {
    if (search) return buildings;
    if (!selectedDistrict) return buildings;
    const group = grouped.find(([district]) => district === selectedDistrict);
    return group ? group[1] : [];
  }, [search, selectedDistrict, buildings, grouped]);

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
      ) : (
        <>
          {/* 읍면동 가로 칩 2줄 (검색 중이 아닐 때만) */}
          {!search && grouped.length > 1 && (() => {
            const allChips = [
              { district: null, label: `전체 ${buildings.length}`, items: buildings },
              ...grouped.map(([district, items]) => ({ district, label: `${district} ${items.length}`, items })),
            ];
            const mid = Math.ceil(allChips.length / 2);
            const row1 = allChips.slice(0, mid);
            const row2 = allChips.slice(mid);

            const renderChip = (chip: typeof allChips[0], index: number) => {
              const isActive = selectedDistrict === chip.district;
              if (chip.district === null) {
                return (
                  <button
                    key="all"
                    type="button"
                    onClick={() => setSelectedDistrict(null)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                      selectedDistrict === null
                        ? 'border-gray-700 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              }
              const color = CHIP_COLORS[index % CHIP_COLORS.length];
              return (
                <button
                  key={chip.district}
                  type="button"
                  onClick={() => setSelectedDistrict(isActive ? null : chip.district)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                    isActive
                      ? `${color.activeBg} ${color.activeText} border-transparent`
                      : `${color.bg} ${color.border} ${color.text}`
                  }`}
                >
                  {chip.label}
                </button>
              );
            };

            return (
              <div className="sticky top-[52px] z-[5] -mx-4 bg-gray-50 px-4 pb-2 pt-1">
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {row1.map((chip, i) => renderChip(chip, i))}
                  </div>
                  {row2.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                      {row2.map((chip, i) => renderChip(chip, mid + i))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 건물 카드 목록 */}
          <div className="flex flex-col gap-1.5">
            {visibleBuildings.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>

          {selectedDistrict && visibleBuildings.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-400">{selectedDistrict}에 등록된 건물이 없습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
