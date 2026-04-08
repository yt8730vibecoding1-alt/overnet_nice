import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Building as BuildingType } from '@/lib/supabase/types';

interface BuildingCardProps {
  building: BuildingType;
}

export function BuildingCard({ building }: BuildingCardProps) {
  const displayTitle = building.name || building.address;
  const showAddress = building.name ? building.address : null;

  return (
    <Link
      href={`/buildings/${building.id}`}
      className="flex overflow-hidden rounded-xl bg-white shadow-sm transition-all active:scale-[0.98] active:shadow-none"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3">
        {/* 건물명 또는 주소 (메인) + 난이도 */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold text-gray-900">
            {displayTitle}
          </h3>
          {building.difficulty && (
            <div className="flex shrink-0 items-center gap-0.5">
              <Star className="h-3 w-3 fill-star text-star" />
              <span className="text-xs font-bold text-star">{building.difficulty}</span>
            </div>
          )}
        </div>

        {/* 주소 (건물명이 있을 때만 서브로 표시) */}
        {showAddress && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{showAddress}</span>
          </div>
        )}

        {/* 장비 위치 프리뷰 + 수정일 */}
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-sm leading-snug text-gray-500">
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
