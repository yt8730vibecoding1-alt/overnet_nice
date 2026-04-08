'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { DifficultyStars } from './difficulty-stars';
import { AddressSearch } from './address-search';
import { createBuilding, updateBuilding } from '@/actions/buildings';
import toast from 'react-hot-toast';
import type { Building } from '@/lib/supabase/types';

interface BuildingFormProps {
  mode: 'create' | 'edit';
  building?: Building;
}

function FormSection({ title, defaultOpen, children }: { title: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-600"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="space-y-4 border-t border-gray-100 px-4 py-4">{children}</div>}
    </div>
  );
}

export function BuildingForm({ mode, building }: BuildingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(building?.name ?? '');
  const [equipmentLocation, setEquipmentLocation] = useState(building?.equipment_location ?? '');
  const [difficulty, setDifficulty] = useState<number | null>(building?.difficulty ?? null);
  const [address, setAddress] = useState(building?.address ?? '');
  const [wiringStructure, setWiringStructure] = useState(building?.wiring_structure ?? '');
  const [floorPanels, setFloorPanels] = useState(building?.floor_panels ?? '');
  const [accessMethod, setAccessMethod] = useState(building?.access_method ?? '');
  const [adminContact, setAdminContact] = useState(building?.admin_contact ?? '');
  const [indoorPanelLocation, setIndoorPanelLocation] = useState(building?.indoor_panel_location ?? '');
  const [workScope, setWorkScope] = useState(building?.work_scope ?? '');
  const [notes, setNotes] = useState(building?.notes ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !equipmentLocation.trim()) return;

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        equipment_location: equipmentLocation.trim(),
        difficulty,
        address: address.trim() || null,
        wiring_structure: wiringStructure.trim() || null,
        floor_panels: floorPanels.trim() || null,
        access_method: accessMethod.trim() || null,
        admin_contact: adminContact.trim() || null,
        indoor_panel_location: indoorPanelLocation.trim() || null,
        work_scope: workScope.trim() || null,
        notes: notes.trim() || null,
      };

      if (mode === 'create') {
        const id = await createBuilding(data);
        toast.success('건물이 등록되었습니다');
        router.push(`/buildings/${id}`);
      } else if (building) {
        await updateBuilding(building.id, data);
        toast.success('건물 정보가 수정되었습니다');
        router.push(`/buildings/${building.id}`);
      }
    } catch (error) {
      console.error('Building save failed:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

  const hasEquipData = !!(wiringStructure || floorPanels || indoorPanelLocation || workScope);
  const hasAccessData = !!(address || accessMethod || adminContact);
  const hasNotes = !!notes;

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-primary px-4 py-3">
        <button type="button" onClick={() => router.back()} className="p-3 text-white" aria-label="뒤로 가기">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">
          {mode === 'create' ? '건물 등록' : '건물 수정'}
        </h1>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {/* 기본 정보 (항상 표시) */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div>
              <label className={labelClass}>
                건물명 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="예: 경주 힐튼 호텔" />
            </div>

            <div>
              <label className={labelClass}>
                장비 위치 <span className="text-red-500">*</span>
              </label>
              <textarea value={equipmentLocation} onChange={(e) => setEquipmentLocation(e.target.value)} required className={inputClass} rows={3} placeholder="예: 지하1층 MDF실" />
            </div>

            <div>
              <label className={labelClass}>난이도 <span className="text-xs font-normal text-gray-400">(1=쉬움, 5=어려움)</span></label>
              <DifficultyStars value={difficulty} onChange={setDifficulty} size="md" />
            </div>
          </div>

          {/* 배선/설비 정보 */}
          <FormSection title="배선 / 설비 정보" defaultOpen={hasEquipData}>
            <div>
              <label className={labelClass}>배선 구조</label>
              <textarea value={wiringStructure} onChange={(e) => setWiringStructure(e.target.value)} className={inputClass} rows={2} placeholder="배선 구조 설명" />
            </div>
            <div>
              <label className={labelClass}>층별 단자함</label>
              <textarea value={floorPanels} onChange={(e) => setFloorPanels(e.target.value)} className={inputClass} rows={2} placeholder="층별 단자함 위치" />
            </div>
            <div>
              <label className={labelClass}>댁내 단자함 위치</label>
              <textarea value={indoorPanelLocation} onChange={(e) => setIndoorPanelLocation(e.target.value)} className={inputClass} rows={2} placeholder="댁내 단자함 위치" />
            </div>
            <div>
              <label className={labelClass}>작업 범위</label>
              <textarea value={workScope} onChange={(e) => setWorkScope(e.target.value)} className={inputClass} rows={2} placeholder="작업 범위" />
            </div>
          </FormSection>

          {/* 건물 접근 정보 */}
          <FormSection title="건물 접근 정보" defaultOpen={hasAccessData}>
            <div>
              <label className={labelClass}>주소</label>
              <AddressSearch value={address} onChange={setAddress} />
            </div>
            <div>
              <label className={labelClass}>출입 방법</label>
              <textarea value={accessMethod} onChange={(e) => setAccessMethod(e.target.value)} className={inputClass} rows={2} placeholder="건물 출입 방법" />
            </div>
            <div>
              <label className={labelClass}>관리실 연락처</label>
              <input type="tel" value={adminContact} onChange={(e) => setAdminContact(e.target.value)} className={inputClass} placeholder="전화번호" />
            </div>
          </FormSection>

          {/* 메모 */}
          <FormSection title="메모 / 주의사항" defaultOpen={hasNotes}>
            <div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={3} placeholder="메모, 주의사항 등 자유롭게 작성" />
            </div>
          </FormSection>

          {/* 하단 여백 */}
          <div className="h-20" />
        </div>

        {/* 저장 버튼 */}
        <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <button
            type="submit"
            disabled={loading || !name.trim() || !equipmentLocation.trim()}
            className="w-full rounded-xl bg-gray-900 py-3.5 text-base font-semibold text-white transition-colors active:bg-gray-800 disabled:opacity-50"
          >
            {loading ? '저장 중...' : mode === 'create' ? '저장' : '수정'}
          </button>
        </div>
      </form>
    </div>
  );
}
