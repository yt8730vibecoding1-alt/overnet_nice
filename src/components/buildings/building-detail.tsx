'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, MapPin, Network, KeyRound, Phone, Notebook, Package, Settings, Wrench, Camera, Building2 } from 'lucide-react';
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

type Tab = 'info' | 'photos' | 'dongs';

export function BuildingDetail({ building }: BuildingDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const label = building.name || building.address;
    if (!window.confirm(`"${label}"을(를) 삭제하시겠습니까?`)) return;

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

  const displayTitle = building.name || building.address;
  const buildingPhotos = (building.photos ?? []).filter((p) => !p.dong_id);
  const dongCount = building.dongs?.length ?? 0;
  const photoCount = building.photos?.length ?? 0;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'info', label: '정보' },
    { key: 'photos', label: '사진', badge: photoCount },
    { key: 'dongs', label: '동', badge: dongCount },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => router.back()} className="shrink-0 p-2 text-white" aria-label="뒤로 가기">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-bold text-white">{displayTitle}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {building.difficulty && <DifficultyStars value={building.difficulty} size="sm" />}
            <Link href={`/buildings/${building.id}/edit`} className="p-2 text-white" aria-label="수정">
              <Pencil className="h-5 w-5" />
            </Link>
            <button type="button" onClick={handleDelete} disabled={deleting} className="p-2 text-white disabled:opacity-50" aria-label="삭제">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 주소 + 건물명 서브 */}
        <div className="mt-1 flex items-center gap-1.5 pl-9 text-sm text-white/70">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{building.address}</span>
        </div>
        {building.name && building.name !== building.address && (
          <div className="mt-0.5 flex items-center gap-1.5 pl-9 text-xs text-white/50">
            <Building2 className="h-3 w-3 shrink-0" />
            <span>{building.name}</span>
          </div>
        )}
      </header>

      {/* 탭 바 */}
      <div className="sticky top-[100px] z-[5] flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className="mb-3 text-xs text-gray-400">최근 수정: {formatRelativeTime(building.updated_at)}</p>

          {/* 정보 탭 */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              {/* 장비 위치 */}
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

              {/* 출입 / 관리실 */}
              {building.access_method && (
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <KeyRound className="h-4 w-4" />
                    출입 방법
                  </div>
                  <p className="whitespace-pre-wrap text-base">{building.access_method}</p>
                </section>
              )}

              {building.admin_contact && (
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <Phone className="h-4 w-4" />
                    관리실 연락처
                  </div>
                  <a href={`tel:${building.admin_contact.replace(/[^0-9+\-]/g, '')}`} className="text-base font-medium text-primary underline">
                    {building.admin_contact}
                  </a>
                </section>
              )}

              {/* 메모 */}
              {building.notes && (
                <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <Notebook className="h-4 w-4" />
                    메모 / 주의사항
                  </div>
                  <p className="whitespace-pre-wrap text-base text-amber-900">{building.notes}</p>
                </section>
              )}

              {/* 설비 상세 */}
              {(building.indoor_panel_location || building.floor_panels || building.work_scope) && (
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-400">설비 상세</p>
                  {building.floor_panels && (
                    <section className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <Settings className="h-4 w-4" />
                        층별 단자함
                      </div>
                      <p className="whitespace-pre-wrap text-base">{building.floor_panels}</p>
                    </section>
                  )}
                  {building.indoor_panel_location && (
                    <section className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <Package className="h-4 w-4" />
                        댁내 단자함
                      </div>
                      <p className="whitespace-pre-wrap text-base">{building.indoor_panel_location}</p>
                    </section>
                  )}
                  {building.work_scope && (
                    <section className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <Wrench className="h-4 w-4" />
                        작업 범위
                      </div>
                      <p className="whitespace-pre-wrap text-base">{building.work_scope}</p>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 사진 탭 */}
          {activeTab === 'photos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500">건물 사진</h3>
                <PhotoUpload
                  buildingId={building.id}
                  currentCount={photoCount}
                />
              </div>
              <PhotoGrid photos={buildingPhotos} buildingId={building.id} />
              {buildingPhotos.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                  <Camera className="h-8 w-8" />
                  <p className="text-sm">등록된 사진이 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 동 탭 */}
          {activeTab === 'dongs' && (
            <DongList
              buildingId={building.id}
              dongs={building.dongs ?? []}
              photos={building.photos ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
