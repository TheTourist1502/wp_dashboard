import clsx from 'clsx';

import { focusRing } from '../widget';

// Pill group of mutually exclusive filters (portfolio, range, gainers/losers, news scope).
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex max-w-full gap-0.5 overflow-x-auto rounded-md border border-hairline-soft bg-canvas p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'h-9 shrink-0 whitespace-nowrap rounded-sm px-3 text-caption font-medium',
              focusRing,
              active ? 'bg-surface-card text-ink' : 'text-muted',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
