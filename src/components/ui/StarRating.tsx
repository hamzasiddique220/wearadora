'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

/** Read-only when `onChange` is omitted; interactive click/hover input otherwise. */
export default function StarRating({
  value,
  onChange,
  size = 16,
  className = '',
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hover ?? value;

  return (
    <div
      className={`flex gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Select rating' : `Rated ${value} out of 5 stars`}
      onMouseLeave={() => interactive && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((s) =>
        interactive ? (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={`${s} star${s > 1 ? 's' : ''}`}
            onClick={() => onChange!(s)}
            onMouseEnter={() => setHover(s)}
            className="cursor-pointer transition-transform hover:scale-110 p-0.5 -m-0.5"
          >
            <Star
              size={size}
              fill={s <= display ? '#8b6f47' : 'none'}
              color={s <= display ? '#8b6f47' : '#d4c9b8'}
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <Star
            key={s}
            size={size}
            fill={s <= display ? '#8b6f47' : 'none'}
            color={s <= display ? '#8b6f47' : '#d4c9b8'}
            strokeWidth={1.5}
          />
        )
      )}
    </div>
  );
}
