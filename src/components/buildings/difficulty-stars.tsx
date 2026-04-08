'use client';

interface DifficultyStarsProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: 'sm' | 'md';
}

const LEVELS = [
  { level: 1, label: '쉬움', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 border-emerald-200' },
  { level: 2, label: '보통', color: 'bg-lime-500', textColor: 'text-lime-700', bgLight: 'bg-lime-50 border-lime-200' },
  { level: 3, label: '중간', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50 border-amber-200' },
  { level: 4, label: '어려움', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 border-orange-200' },
  { level: 5, label: '최고', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 border-red-200' },
];

export function DifficultyStars({ value, onChange, size = 'sm' }: DifficultyStarsProps) {
  const interactive = !!onChange;

  // 읽기 전용 (카드, 상세 헤더 등)
  if (!interactive) {
    if (!value) return null;
    const config = LEVELS[value - 1];
    if (size === 'sm') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${config.bgLight} ${config.textColor}`}>
          {value} {config.label}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${config.bgLight} ${config.textColor}`}>
        {value} {config.label}
      </span>
    );
  }

  // 입력 모드 (폼)
  return (
    <div className="flex gap-1.5">
      {LEVELS.map((config) => {
        const isSelected = value === config.level;
        return (
          <button
            key={config.level}
            type="button"
            onClick={() => onChange(isSelected ? null : config.level)}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl border-2 transition-all ${
              isSelected
                ? `${config.bgLight} border-current ${config.textColor}`
                : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            <span className="text-base font-bold">{config.level}</span>
            <span className="text-[10px] font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
