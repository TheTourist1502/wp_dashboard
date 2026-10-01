import clsx from 'clsx';
import { type ReactNode, useId } from 'react';

export const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15';

// Card shell every dashboard widget sits in: serif title, optional controls, body.
export default function Widget({
  title,
  actions,
  className,
  flush = false,
  children,
}: {
  title: string;
  actions?: ReactNode;
  className?: string;
  /** Body runs edge to edge (tables); only the header keeps the side padding. */
  flush?: boolean;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        'flex min-w-0 flex-col gap-5 overflow-hidden rounded-lg border border-hairline-soft bg-surface-soft',
        flush ? 'pt-6' : 'p-6',
        className,
      )}
    >
      <header className={clsx('flex flex-wrap items-center justify-between gap-3', flush && 'px-6')}>
        <h2 id={headingId} className="font-display text-display-sm font-medium text-ink">
          {title}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function Skeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={clsx('flex flex-col gap-3', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-10 rounded-md bg-surface-card motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorState({ what, onRetry }: { what: string; onRetry: () => unknown }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline-soft p-4 text-body-sm text-muted"
    >
      Couldn&apos;t load {what}.
      <button
        type="button"
        onClick={() => void onRetry()}
        className={clsx(
          'h-10 rounded-md border border-hairline bg-canvas px-5 text-button font-medium text-ink',
          focusRing,
        )}
      >
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-body-sm text-muted">{children}</p>;
}

export function Legend({ swatch, children }: { swatch: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={clsx('h-0.5 w-3 shrink-0 rounded-full', swatch)} />
      {children}
    </span>
  );
}
