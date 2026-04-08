'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width: string;
        height: string;
      }) => { embed: (element: HTMLElement) => void };
    };
  }
}

interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  /** 법정동/법정리 이름 (예: "황성동", "보문동") */
  bname: string;
  /** 법정동/법정리 시군구 (예: "경주시") */
  sigungu: string;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
}

export function AddressSearch({ value, onChange }: AddressSearchProps) {
  const scriptLoaded = useRef(false);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scriptLoaded.current) return;
    if (document.getElementById('daum-postcode-script')) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'daum-postcode-script';
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  const openPostcode = useCallback(() => {
    if (!window.daum || !layerRef.current) return;

    layerRef.current.style.display = 'block';

    new window.daum.Postcode({
      oncomplete(data: DaumPostcodeData) {
        // 도로명 주소 + 법정동을 괄호로 추가
        // 예: "경상북도 경주시 용담로104번길 41 (황성동)"
        const addr = data.roadAddress || data.jibunAddress;
        const parts: string[] = [];
        if (data.bname) parts.push(data.bname);
        if (data.buildingName) parts.push(data.buildingName);

        const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : '';
        onChange(`${addr}${suffix}`);
        if (layerRef.current) layerRef.current.style.display = 'none';
      },
      onclose() {
        if (layerRef.current) layerRef.current.style.display = 'none';
      },
      width: '100%',
      height: '100%',
    }).embed(layerRef.current);
  }, [onChange]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          placeholder="주소를 검색하거나 직접 입력"
        />
        <button
          type="button"
          onClick={openPostcode}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-200"
        >
          <MapPin className="h-4 w-4" />
          검색
        </button>
      </div>

      {/* 다음 주소 검색 임베드 영역 */}
      <div
        ref={layerRef}
        style={{ display: 'none' }}
        className="relative mt-2 h-[400px] overflow-hidden rounded-xl border border-gray-300"
      />
    </div>
  );
}
