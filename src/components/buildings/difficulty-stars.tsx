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
      {[1, 2, 3, 4, 5].map((star) => {
        const starIcon = (
          <Star
            className={`${starSize} ${
              value && star <= value
                ? 'fill-star text-star'
                : 'fill-none text-gray-300'
            }`}
          />
        );

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(value === star ? null : star)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            >
              {starIcon}
            </button>
          );
        }

        return (
          <span key={star} className="inline-flex">
            {starIcon}
          </span>
        );
      })}
    </div>
  );
}
