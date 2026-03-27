'use client';

import { useState, useEffect, useTransition } from 'react';
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

  return (
    <div className="flex flex-1 flex-col gap-3">
      <SearchBar value={search} onChange={setSearch} />

      {isPending ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-gray-400">
            {search ? '검색 결과가 없습니다' : '등록된 건물이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}
    </div>
  );
}
