'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface WiringInputProps {
  value: string;
  onChange: (value: string) => void;
}

type WiringType = 'hub' | 'serial' | 'custom';

interface SerialRoute {
  id: string;
  rooms: string;
}

/**
 * 저장 형식:
 * - 허브 분배: "[허브분배] 허브위치: 거실 → 각 방으로 분배"
 * - 직렬 연결: "[직렬] 입구방 → 거실 → 안방\n[직렬] 입구방 → 주방 → 옆방"
 * - 직접 입력: 사용자 자유 텍스트
 */
function parseExisting(value: string): { type: WiringType; hubLocation: string; routes: SerialRoute[]; custom: string } {
  if (!value) return { type: 'custom', hubLocation: '', routes: [{ id: '1', rooms: '' }], custom: '' };

  if (value.startsWith('[허브분배]')) {
    const hubLocation = value.replace('[허브분배] ', '').replace('허브위치: ', '').replace(/ → 각 방으로 분배$/, '');
    return { type: 'hub', hubLocation, routes: [{ id: '1', rooms: '' }], custom: '' };
  }

  if (value.includes('[직렬]')) {
    const lines = value.split('\n').filter((l) => l.startsWith('[직렬]'));
    const routes = lines.map((line, i) => ({
      id: String(i + 1),
      rooms: line.replace('[직렬] ', ''),
    }));
    return { type: 'serial', hubLocation: '', routes: routes.length > 0 ? routes : [{ id: '1', rooms: '' }], custom: '' };
  }

  return { type: 'custom', hubLocation: '', routes: [{ id: '1', rooms: '' }], custom: value };
}

function serialize(type: WiringType, hubLocation: string, routes: SerialRoute[], custom: string): string {
  if (type === 'hub') {
    return hubLocation.trim() ? `[허브분배] 허브위치: ${hubLocation.trim()} → 각 방으로 분배` : '';
  }
  if (type === 'serial') {
    const valid = routes.filter((r) => r.rooms.trim());
    if (valid.length === 0) return '';
    return valid.map((r) => `[직렬] ${r.rooms.trim()}`).join('\n');
  }
  return custom;
}

export function WiringInput({ value, onChange }: WiringInputProps) {
  const parsed = parseExisting(value);
  const [type, setType] = useState<WiringType>(parsed.type);
  const [hubLocation, setHubLocation] = useState(parsed.hubLocation);
  const [routes, setRoutes] = useState<SerialRoute[]>(parsed.routes);
  const [custom, setCustom] = useState(parsed.custom);

  // 타입이나 값 바뀔 때 serialize해서 부모에 전달
  useEffect(() => {
    const serialized = serialize(type, hubLocation, routes, custom);
    if (serialized !== value) {
      onChange(serialized);
    }
  }, [type, hubLocation, routes, custom]);

  const addRoute = () => {
    setRoutes([...routes, { id: String(Date.now()), rooms: '' }]);
  };

  const removeRoute = (id: string) => {
    if (routes.length <= 1) return;
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const updateRoute = (id: string, rooms: string) => {
    setRoutes(routes.map((r) => r.id === id ? { ...r, rooms } : r));
  };

  const inputClass = 'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <div className="space-y-3">
      {/* 타입 선택 */}
      <div className="flex gap-1.5">
        {([
          { key: 'hub' as const, label: '허브 분배' },
          { key: 'serial' as const, label: '직렬 연결' },
          { key: 'custom' as const, label: '직접 입력' },
        ]).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setType(opt.key)}
            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
              type === opt.key
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 허브 분배 */}
      {type === 'hub' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">허브 위치</label>
          <input
            type="text"
            value={hubLocation}
            onChange={(e) => setHubLocation(e.target.value)}
            className={inputClass}
            placeholder="예: 거실 TV장 아래, 현관 분배함"
          />
          <p className="mt-1 text-xs text-gray-400">허브에서 각 방으로 개별 배선</p>
        </div>
      )}

      {/* 직렬 연결 (다갈래) */}
      {type === 'serial' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">방 순서를 → 로 구분 (갈래별로 추가 가능)</p>
          {routes.map((route, index) => (
            <div key={route.id} className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-bold text-gray-400">{index + 1}</span>
              <input
                type="text"
                value={route.rooms}
                onChange={(e) => updateRoute(route.id, e.target.value)}
                className={inputClass}
                placeholder="예: 입구방 → 거실 → 안방"
              />
              {routes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoute(route.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRoute}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary active:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            갈래 추가
          </button>
        </div>
      )}

      {/* 직접 입력 */}
      {type === 'custom' && (
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className={inputClass}
          rows={3}
          placeholder="배선 구조를 자유롭게 입력"
        />
      )}
    </div>
  );
}
