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
 * 경주시 행정구역 (4읍 8면 11행정동)
 * 도로명 주소에서 법정동/읍/면을 매칭하기 위한 키워드 목록
 * - 법정동: 주소에 "OO동"으로 나올 수 있음
 * - 도로명: "보문로" → 보문동, "황성로" → 황성동 등으로 매핑
 */
interface DistrictDef {
  label: string;
  // 주소에서 이 키워드가 포함되면 해당 지역으로 분류
  keywords: string[];
}

const DISTRICTS: DistrictDef[] = [
  // 행정동 (시내)
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
  // 읍
  { label: '안강읍', keywords: ['안강읍', '안강'] },
  { label: '건천읍', keywords: ['건천읍', '건천'] },
  { label: '외동읍', keywords: ['외동읍', '외동'] },
  { label: '감포읍', keywords: ['감포읍', '감포'] },
  // 면
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

  // 1) 괄호 안 법정동 우선 파싱: "...로 123 (황성동)" or "(황성동, 건물명)"
  const parenMatch = addr.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parenContent = parenMatch[1];
    for (const district of DISTRICTS) {
      if (district.keywords.some((kw) => parenContent.includes(kw))) {
        return district.label;
      }
    }
  }

  // 2) 주소 전체에서 키워드 매칭 (도로명, 지번 등)
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

  // 건물 수 많은 순, 기타는 마지막
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === '기타') return 1;
    if (b[0] === '기타') return -1;
    return b[1].length - a[1].length;
  });
}

const DISTRICT_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-lime-500',
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
        <div className="flex flex-col gap-2">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      ) : (
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
