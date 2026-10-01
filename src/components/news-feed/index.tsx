import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { dashboardQueries } from '../../api';
import { useAppDispatch, useAppSelector } from '../../store';
import { newsScopeSelected } from '../../store/dashboard-slice';
import type { NewsScope } from '../../types';
import { timeAgo } from '../../utils/format';
import SegmentedControl from '../segmented-control';
import Widget, { EmptyState, ErrorState, focusRing, Skeleton } from '../widget';

const TABS: { value: NewsScope; label: string }[] = [
  { value: 'market', label: 'Market' },
  { value: 'holdings', label: 'My holdings' },
];
const MAX_SYMBOLS = 3;

// Article and image URLs come from a third-party feed; only allow http(s) into href/src.
const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : undefined);

// GET /api/news?limit=3 or /api/news/holdings?limit=3
export default function NewsFeed({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const scope = useAppSelector((s) => s.dashboard.newsScope);
  const q = useQuery({ ...dashboardQueries.news(scope), placeholderData: keepPreviousData });

  return (
    <Widget
      title="News"
      className={className}
      actions={
        <SegmentedControl
          label="News"
          options={TABS}
          value={scope}
          onChange={(s) => dispatch(newsScopeSelected(s))}
        />
      }
    >
      {q.isPending ? (
        <Skeleton rows={3} className="[&>div]:h-16" />
      ) : q.isError ? (
        <ErrorState what="news" onRetry={q.refetch} />
      ) : q.data.length === 0 ? (
        <EmptyState>No news right now.</EmptyState>
      ) : (
        <ul className={clsx('flex flex-col', q.isPlaceholderData && 'opacity-60')}>
          {q.data.map((a) => (
            <li key={a.id} className="border-t border-hairline-soft first:border-t-0">
              <a
                href={safeUrl(a.url)}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx('flex items-center gap-4 rounded-md py-3.5', focusRing)}
              >
                {safeUrl(a.thumbnailUrl) ? (
                  <img
                    src={safeUrl(a.thumbnailUrl)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="size-16 shrink-0 rounded-md bg-surface-card object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-16 shrink-0 items-center justify-center rounded-md bg-surface-card font-display text-display-sm text-muted"
                  >
                    {a.publisher.charAt(0)}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-title-sm font-medium text-ink">{a.title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-caption text-muted">
                    <span>{a.publisher}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={a.publishedAt}>{timeAgo(a.publishedAt)}</time>
                    {a.symbols.slice(0, MAX_SYMBOLS).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-surface-card px-2 font-mono text-caption text-body"
                      >
                        {s}
                      </span>
                    ))}
                    {a.symbols.length > MAX_SYMBOLS && (
                      <span>+{a.symbols.length - MAX_SYMBOLS}</span>
                    )}
                  </span>
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}
