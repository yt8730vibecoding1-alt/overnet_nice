'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, ChevronDown, ChevronUp, MapPin, Wrench, Network, KeyRound, Phone, Notebook, Package, Settings } from 'lucide-react';
import { DifficultyStars } from './difficulty-stars';
import { DongList } from '@/components/dongs/dong-list';
import { PhotoGrid } from '@/components/photos/photo-grid';
import { PhotoUpload } from '@/components/photos/photo-upload';
import { deleteBuilding } from '@/actions/buildings';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BuildingWithDetails } from '@/lib/supabase/types';

interface BuildingDetailProps {
  building: BuildingWithDetails;
}

export function BuildingDetail({ building }: BuildingDetailProps) {
  const router = useRouter();
  const [showEquipDetail, setShowEquipDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`"${building.name}"을(를) 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      await deleteBuilding(building.id);
      toast.success('건물이 삭제되었습니다');
      router.push('/');
    } catch {
      toast.error('삭제에 실패했습니다');
      setDeleting(false);
    }
  };

  // 출입 정보 (항상 표시)
  const accessItems = [
    { label: '출입 방법', value: building.access_method, icon: KeyRound },
    { label: '관리실 연락처', value: building.admin_contact, icon: Phone, isTel: true },
    { label: '주소', value: building.address, icon: MapPin },
  ].filter((item) => item.value);

  // 설비 상세 (접힘)
  const equipDetailItems = [
    { label: '댁내 단자함', value: building.indoor_panel_location, icon: Package },
    { label: '층별 단자함', value: building.floor_panels, icon: Settings },
    { label: '작업 범위', value: building.work_scope, icon: Wrench },
  ].filter((item) => item.value);

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-primary px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={() => router.push('/')} className="shrink-0 p-3 text-white" aria-label="뒤로 가기">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="truncate text-lg font-bold text-white">{building.name}</h1>
          {building.difficulty && (
            <div className="shrink-0">
              <DifficultyStars value={building.difficulty} size="sm" />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link href={`/buildings/${building.id}/edit`} className="p-3 text-white" aria-label="수정">
            <Pencil className="h-5 w-5" />
          </Link>
          <button type="button" onClick={handleDelete} disabled={deleting} className="p-3 text-white disabled:opacity-50" aria-label="삭제">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          <p className="text-xs text-gray-400">최근 수정: {formatRelativeTime(building.updated_at)}</p>

          {/* 장비 위치 (핵심 정보) */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Network className="h-4 w-4" />
              장비 위치
            </div>
            <p className="whitespace-pre-wrap text-base">{building.equipment_location}</p>
          </section>

          {/* 배선 구조 */}
          {building.wiring_structure && (
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                <Network className="h-4 w-4" />
                배선 구조
              </div>
              <p className="whitespace-pre-wrap text-base">{building.wiring_structure}</p>
            </section>
          )}

          {/* 출입 정보 (항상 펼침) */}
          {accessItems.length > 0 && (
            <div className="space-y-3">
              {accessItems.map((item) => (
                <section key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {'isTel' in item && item.isTel ? (
                    <a href={`tel:${item.value!.replace(/[^0-9+\-]/g, '')}`} className="text-base font-medium text-primary underline">
                      {item.value}
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap text-base">{item.value}</p>
                  )}
                </section>
              ))}
            </div>
          )}

          {/* 메모 / 주의사항 */}
          {building.notes && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <Notebook className="h-4 w-4" />
                메모 / 주의사항
              </div>
              <p className="whitespace-pre-wrap text-base text-amber-900">{building.notes}</p>
            </section>
          )}

          {/* 동 목록 */}
          <DongList
            buildingId={building.id}
            dongs={building.dongs ?? []}
            photos={building.photos ?? []}
          />

          {/* 건물 사진 */}
          {(() => {
            const buildingPhotos = (building.photos ?? []).filter((p) => !p.dong_id);
            return (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-500">사진</h3>
                  <PhotoUpload
                    buildingId={building.id}
                    currentCount={building.photos?.length ?? 0}
                  />
                </div>
                <PhotoGrid photos={buildingPhotos} buildingId={building.id} />
              </section>
            );
          })()}

          {/* 설비 상세 (접힘) */}
          {equipDetailItems.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowEquipDetail(!showEquipDetail)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600"
              >
                설비 상세 ({equipDetailItems.length}개)
                {showEquipDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showEquipDetail && (
                <div className="mt-2 space-y-3">
                  {equipDetailItems.map((item) => (
                    <section key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <p className="whitespace-pre-wrap text-base">{item.value}</p>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
