import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Building as BuildingType } from '@/lib/supabase/types';

interface RegionConfig {
  prefixes: string[];
  color: string;
  label: string;
}

interface BuildingCardProps {
  building: BuildingType;
  regionConfig?: RegionConfig;
}

export function BuildingCard({ building, regionConfig }: BuildingCardProps) {
  const displayTitle = building.address;
  const displaySub = building.name;

  return (
    <Link
      href={`/buildings/${building.id}`}
      className="group relative flex overflow-hidden rounded-xl bg-white shadow-sm transition-all active:scale-[0.98] active:shadow-none"
    >
      {/* 지역 컬러 스트라이프 */}
      {regionConfig && (
        <div className={`w-1.5 shrink-0 ${regionConfig.color}`} />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3">
        {/* 주소 (메인) + 난이도 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <h3 className="truncate text-[15px] font-bold text-gray-900">
              {displayTitle}
            </h3>
          </div>
          {building.difficulty && (
            <div className="flex shrink-0 items-center gap-0.5">
              <Star className="h-3 w-3 fill-star text-star" />
              <span className="text-xs font-bold text-star">{building.difficulty}</span>
            </div>
          )}
        </div>

        {/* 건물명 (있으면 표시) */}
        {displaySub && (
          <p className="truncate text-sm font-medium text-gray-600">{displaySub}</p>
        )}

        {/* 장비 위치 프리뷰 + 수정일 */}
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-sm leading-snug text-gray-400">
            {building.equipment_location}
          </p>
          <span className="shrink-0 text-xs tabular-nums text-gray-400">
            {formatRelativeTime(building.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
