'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { SearchBar } from './search-bar';
import { BuildingCard } from './building-card';
import { useDebounce } from '@/hooks/use-debounce';
import { getBuildings } from '@/actions/buildings';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Building } from '@/lib/supabase/types';

interface BuildingListProps {
  initialBuildings: Building[];
}

/**
 * 주소에서 읍/면/동을 추출한다.
 * "경상북도 경주시 보문로 484-7" → "보문동" (도로명 기반 추정)
 * "경상북도 경주시 동천동 123" → "동천동"
 * 패턴: 시/군/구 다음의 읍/면/동, 또는 도로명에서 동네 추출
 */
function extractDistrict(address: string): string {
  // 1) "OO동", "OO읍", "OO면" 직접 매칭 (지번 주소)
  const dongMatch = address.match(/([가-힣]{1,4}(?:동|읍|면))(?:\s|$|\d)/);
  if (dongMatch) return dongMatch[1];

  // 2) 도로명에서 추출: "경주시 XXX로" → XXX 부분을 지역명으로 사용
  const roadMatch = address.match(/(?:시|군|구)\s+([가-힣]{1,5})(?:로|길)/);
  if (roadMatch) return roadMatch[1];

  // 3) 건물명이나 단지명에 동 정보가 있는 경우
  const buildingDongMatch = address.match(/\(([가-힣]{1,4}(?:동))\)/);
  if (buildingDongMatch) return buildingDongMatch[1];

  return '기타';
}

function groupByDistrict(buildings: Building[]): [string, Building[]][] {
  const groups = new Map<string, Building[]>();

  for (const building of buildings) {
    const district = extractDistrict(building.address);
    if (!groups.has(district)) groups.set(district, []);
    groups.get(district)!.push(building);
  }

  // 건물 수가 많은 순서로 정렬, 기타는 항상 마지막
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === '기타') return 1;
    if (b[0] === '기타') return -1;
    return b[1].length - a[1].length;
  });
}

// 읍면동별 컬러 (순환 사용)
const DISTRICT_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
];

export function BuildingList({ initialBuildings }: BuildingListProps) {
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState(initialBuildings);
  const [isPending, startTransition] = useTransition();
  const [collapsedDistricts, setCollapsedDistricts] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    startTransition(async () => {
      const results = await getBuildings(debouncedSearch || undefined);
      setBuildings(results);
    });
  }, [debouncedSearch]);

  const grouped = useMemo(() => groupByDistrict(buildings), [buildings]);

  const toggleDistrict = (district: string) => {
    setCollapsedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(district)) next.delete(district);
      else next.add(district);
      return next;
    });
  };

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
        /* 검색 시 플랫 리스트 */
        <div className="flex flex-col gap-2">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      ) : (
        /* 읍면동별 아코디언 그룹 */
        <div className="flex flex-col gap-2">
          {grouped.map(([district, items], index) => {
            const isCollapsed = collapsedDistricts.has(district);
            const color = DISTRICT_COLORS[index % DISTRICT_COLORS.length];

            return (
              <section key={district}>
                <button
                  type="button"
                  onClick={() => toggleDistrict(district)}
                  className="sticky top-[52px] z-[5] flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm active:bg-gray-50"
                >
                  <div className={`h-4 w-1.5 rounded-full ${color}`} />
                  <h2 className="text-sm font-bold text-gray-700">{district}</h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                    {items.length}
                  </span>
                  <div className="ml-auto">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {items.map((building) => (
                      <BuildingCard key={building.id} building={building} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
