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
  const equipPreview = building.equipment_location
    .split('\n')[0]
    .slice(0, 40);

  return (
    <Link
      href={`/buildings/${building.id}`}
      className="group relative flex overflow-hidden rounded-xl bg-white shadow-sm transition-all active:scale-[0.98] active:shadow-none"
    >
      {/* 지역 컬러 스트라이프 */}
      {regionConfig && (
        <div className={`w-1 shrink-0 ${regionConfig.color}`} />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3">
        {/* 건물명 + 난이도 */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold text-gray-900">
            {building.name}
          </h3>
          {building.difficulty && (
            <div className="flex shrink-0 items-center gap-0.5">
              <Star className="h-3 w-3 fill-star text-star" />
              <span className="text-xs font-bold text-star">{building.difficulty}</span>
            </div>
          )}
        </div>

        {/* 장비 위치 프리뷰 */}
        <p className="truncate text-[13px] text-gray-500">
          {equipPreview}
        </p>

        {/* 하단: 주소 + 수정일 */}
        <div className="flex items-center justify-between gap-2">
          {building.address ? (
            <div className="flex min-w-0 items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{building.address}</span>
            </div>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
            {formatRelativeTime(building.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
