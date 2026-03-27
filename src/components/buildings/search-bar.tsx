'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="건물명 검색..."
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
