import { useEffect, useMemo, useRef } from 'react';
import { useUserRepos } from './useUserRepos';
import RateLimitAlert from '../shared/rateLimitAlert';

const isRateLimitError = (incoming: Error | null) =>
  typeof incoming?.message === 'string' &&
  incoming.message.toLowerCase().includes('rate limit');

export interface UserReposListProps {
  username: string | null;
}

export const UserReposList = ({ username }: UserReposListProps) => {
  const trimmedUsername = username?.trim() ?? '';
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserRepos({ username });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const repos = useMemo(() => {
    const flattened = data?.pages.flatMap((page) => page) ?? [];
    return [...flattened].sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );
  }, [data]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [trimmedUsername]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = sentinelRef.current;

    if (!root || !sentinel || !hasNextPage || !trimmedUsername) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      {
        root,
        threshold: 0.2,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    trimmedUsername,
    repos.length,
  ]);

  if (!trimmedUsername) {
    return null;
  }

  if (isError) {
    return isRateLimitError(error) ? (
      <RateLimitAlert message={error?.message} />
    ) : (
      <p className="text-sm text-red-500">
        {error?.message ?? 'Unable to load repositories.'}
      </p>
    );
  }

  if (isLoading && repos.length === 0) {
    return <p className="text-sm text-slate-500">Loading repositories...</p>;
  }

  if (!isLoading && repos.length === 0) {
    return (
      <p className="text-sm text-slate-500">No public repositories found.</p>
    );
  }

  const showPaginationHints = repos.length > 0;
  const baseHintMessage = hasNextPage
    ? 'Scroll for more repositories'
    : 'All repositories are loaded.';

  return (
    <div className="space-y-3">
      <div
        ref={scrollContainerRef}
        className="max-h-80 w-full overflow-x-hidden overflow-y-auto pr-1"
        aria-live="polite"
      >
        <ul className="w-full space-y-3">
          {repos.map((repo) => (
            <li key={repo.id}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="truncate text-base font-semibold text-slate-900"
                    title={repo.name}
                  >
                    {repo.name}
                  </p>
                  {repo.description && (
                    <p className="text-sm text-slate-600">{repo.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500">
                  <span aria-hidden="true">★</span>
                  <span>{repo.stargazers_count}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
      </div>
      {showPaginationHints && (
        <div className="flex flex-col items-center py-2 text-xs text-slate-400">
          <div className="flex w-full items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span>{baseHintMessage}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          {hasNextPage && (
            <div
              className={`mt-1 flex items-center gap-2 text-[11px] transition-opacity duration-200 ${isFetchingNextPage ? 'opacity-100' : 'opacity-0'}`}
              aria-live="polite"
            >
              <span
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400"
                aria-hidden="true"
              />
              <span>Loading more repositories...</span>
            </div>
          )}
          <div
            className="mt-1 text-lg leading-none text-slate-300"
            aria-hidden="true"
          >
            ↓
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReposList;
