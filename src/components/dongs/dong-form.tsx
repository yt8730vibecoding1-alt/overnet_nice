'use client';

import { useState } from 'react';
import { createDong, updateDong } from '@/actions/dongs';
import toast from 'react-hot-toast';
import type { Dong } from '@/lib/supabase/types';

interface DongFormProps {
  buildingId: string;
  dong?: Dong;
  onClose: () => void;
  onSaved: () => void;
}

export function DongForm({ buildingId, dong, onClose, onSaved }: DongFormProps) {
  const isEdit = !!dong;
  const [loading, setLoading] = useState(false);
  const [dongName, setDongName] = useState(dong?.dong_name ?? '');
  const [equipmentLocation, setEquipmentLocation] = useState(dong?.equipment_location ?? '');
  const [wiringStructure, setWiringStructure] = useState(dong?.wiring_structure ?? '');
  const [floorPanels, setFloorPanels] = useState(dong?.floor_panels ?? '');
  const [notes, setNotes] = useState(dong?.notes ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dongName.trim()) return;

    setLoading(true);
    try {
      const data = {
        dong_name: dongName.trim(),
        equipment_location: equipmentLocation.trim() || null,
        wiring_structure: wiringStructure.trim() || null,
        floor_panels: floorPanels.trim() || null,
        notes: notes.trim() || null,
      };

      if (isEdit && dong) {
        await updateDong(dong.id, buildingId, data);
        toast.success('동 정보가 수정되었습니다');
      } else {
        await createDong({ ...data, building_id: buildingId });
        toast.success('동이 추가되었습니다');
      }
      onSaved();
    } catch (error) {
      console.error('Dong save failed:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="safe-bottom w-full max-w-lg rounded-t-2xl bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        <h3 className="mb-4 text-lg font-bold">{isEdit ? '동 수정' : '동 추가'}</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              동 이름 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={dongName} onChange={(e) => setDongName(e.target.value)} required className={inputClass} placeholder="예: 101동" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">장비 위치</label>
            <textarea value={equipmentLocation} onChange={(e) => setEquipmentLocation(e.target.value)} className={inputClass} rows={2} placeholder="장비 위치" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">배선 구조</label>
            <textarea value={wiringStructure} onChange={(e) => setWiringStructure(e.target.value)} className={inputClass} rows={2} placeholder="배선 구조" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">층별 단자함</label>
            <textarea value={floorPanels} onChange={(e) => setFloorPanels(e.target.value)} className={inputClass} rows={2} placeholder="층별 단자함" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">메모</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} placeholder="메모" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-3 text-base font-medium">
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !dongName.trim()}
              className="flex-1 rounded-lg bg-primary py-3 text-base font-semibold text-white disabled:opacity-50"
            >
              {loading ? '저장 중...' : isEdit ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
