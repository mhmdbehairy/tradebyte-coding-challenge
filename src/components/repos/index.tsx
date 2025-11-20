import { useEffect, useMemo, useRef } from 'react';
import { useUserRepos } from './useUserRepos';

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

  if (!trimmedUsername) {
    return null;
  }

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, trimmedUsername, repos.length]);

  if (isError) {
    return (
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

  return (
    <div className="space-y-3">
      <div
        ref={scrollContainerRef}
        className="max-h-80 overflow-y-auto pr-1"
        aria-live="polite"
      >
        <ul className="space-y-3">
          {repos.map((repo) => (
            <li key={repo.id}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-base font-semibold text-slate-900">
                    {repo.name}
                  </p>
                  {repo.description && (
                    <p className="text-sm text-slate-600">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                  <span aria-hidden="true">★</span>
                  <span>{repo.stargazers_count}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
      </div>
      {isFetchingNextPage && (
        <p className="text-xs text-slate-400">Loading more repositories...</p>
      )}
    </div>
  );
};

export default UserReposList;
