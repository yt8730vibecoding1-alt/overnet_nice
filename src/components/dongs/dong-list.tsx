'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, Network } from 'lucide-react';
import { DongForm } from './dong-form';
import { PhotoGrid } from '@/components/photos/photo-grid';
import { PhotoUpload } from '@/components/photos/photo-upload';
import { deleteDong } from '@/actions/dongs';
import toast from 'react-hot-toast';
import type { Dong, Photo } from '@/lib/supabase/types';

interface DongListProps {
  buildingId: string;
  dongs: Dong[];
  photos?: Photo[];
}

export function DongList({ buildingId, dongs, photos = [] }: DongListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDong, setEditingDong] = useState<Dong | undefined>(undefined);

  const handleDelete = async (dong: Dong) => {
    if (!window.confirm(`"${dong.dong_name}"을(를) 삭제하시겠습니까?`)) return;

    try {
      await deleteDong(dong.id, buildingId);
      toast.success('동이 삭제되었습니다');
      router.refresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingDong(undefined);
    router.refresh();
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500">동 목록 ({dongs.length})</h3>
        <button
          type="button"
          onClick={() => { setEditingDong(undefined); setShowForm(true); }}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
        >
          <Plus className="h-4 w-4" />
          동 추가
        </button>
      </div>

      <div className="space-y-2">
        {dongs.map((dong) => (
          <div key={dong.id} className="rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === dong.id ? null : dong.id)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <span className="font-medium">{dong.dong_name}</span>
              {expandedId === dong.id ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedId === dong.id && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                {dong.equipment_location && (
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <Network className="h-3 w-3" />
                      장비 위치
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">{dong.equipment_location}</p>
                  </div>
                )}
                {dong.wiring_structure && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500">배선 구조</div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">{dong.wiring_structure}</p>
                  </div>
                )}
                {dong.floor_panels && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500">층별 단자함</div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">{dong.floor_panels}</p>
                  </div>
                )}
                {dong.notes && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500">메모</div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">{dong.notes}</p>
                  </div>
                )}

                {/* 동별 사진 */}
                {(() => {
                  const dongPhotos = photos.filter((p) => p.dong_id === dong.id);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">사진</span>
                        <PhotoUpload
                          buildingId={buildingId}
                          dongId={dong.id}
                          currentCount={dongPhotos.length}
                        />
                      </div>
                      <PhotoGrid photos={dongPhotos} buildingId={buildingId} />
                    </div>
                  );
                })()}

                <div className="flex gap-2 border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingDong(dong); setShowForm(true); }}
                    className="flex min-h-[44px] items-center gap-1 rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(dong)}
                    className="flex min-h-[44px] items-center gap-1 rounded px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <DongForm
          buildingId={buildingId}
          dong={editingDong}
          onClose={() => { setShowForm(false); setEditingDong(undefined); }}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
