'use client';

import { Star } from 'lucide-react';

interface DifficultyStarsProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: 'sm' | 'md';
}

export function DifficultyStars({ value, onChange, size = 'sm' }: DifficultyStarsProps) {
  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  const interactive = !!onChange;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => {
            if (onChange) {
              onChange(value === star ? null : star);
            }
          }}
          className={interactive ? 'min-h-[44px] min-w-[44px] flex items-center justify-center' : 'p-0'}
        >
          <Star
            className={`${starSize} ${
              value && star <= value
                ? 'fill-star text-star'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
