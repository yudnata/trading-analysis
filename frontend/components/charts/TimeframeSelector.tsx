'use client';

import type { HistoryPeriod } from '@/lib/api';

const options: HistoryPeriod[] = ['1H', '4H', '1D', '1W'];

export function TimeframeSelector(props: {
  value: HistoryPeriod;
  onChange: (value: HistoryPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === props.value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => props.onChange(opt)}
            className={[
              'rounded-md border px-3 py-1 text-sm',
              active
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-black'
                : 'border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900/40',
            ].join(' ')}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
