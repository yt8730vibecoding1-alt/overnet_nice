import Link from 'next/link';
import { Building } from 'lucide-react';
import { DifficultyStars } from './difficulty-stars';
import { formatRelativeTime } from '@/lib/utils';
import type { Building as BuildingType } from '@/lib/supabase/types';

interface BuildingCardProps {
  building: BuildingType;
}

export function BuildingCard({ building }: BuildingCardProps) {
  return (
    <Link
      href={`/buildings/${building.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Building className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="truncate text-base font-semibold">{building.name}</h3>
        </div>
        {building.difficulty && (
          <DifficultyStars value={building.difficulty} size="sm" />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between">
        {building.address && (
          <p className="truncate text-sm text-gray-500">{building.address}</p>
        )}
        <span className="shrink-0 text-xs text-gray-400">
          {formatRelativeTime(building.updated_at)}
        </span>
      </div>
    </Link>
  );
}
