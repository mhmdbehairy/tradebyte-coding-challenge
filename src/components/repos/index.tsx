import { useEffect, useRef } from 'react';
import { useUserRepos } from './useUserRepos';
import RateLimitAlert from '../shared/rateLimitAlert';
import type { GithubRepo } from '../../types/github';

const isRateLimitError = (incoming: Error | null) =>
  typeof incoming?.message === 'string' &&
  incoming.message.toLowerCase().includes('rate limit');

export interface UserReposListProps {
  username: string | null;
}

export const UserReposList = ({ username }: UserReposListProps) => {
  const trimmedUsername = username?.trim() ?? '';
  const {
    repos,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserRepos({ username });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasRepos = repos.length > 0;
  const isInitialLoad = isLoading && !hasRepos;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [trimmedUsername]);

  useEffect(() => {
    // Watch the sentinel element so we can fetch the next page as soon as the user scrolls near the bottom.
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

  if (isInitialLoad) {
    return <p className="text-sm text-slate-500">Loading repositories...</p>;
  }

  if (!isLoading && !hasRepos) {
    return (
      <p className="text-sm text-slate-500">No public repositories found.</p>
    );
  }

  const showPaginationHints = hasRepos;
  const hintMessage = isFetchingNextPage
    ? 'Loading more repositories...'
    : hasNextPage
      ? 'Scroll for more repositories'
      : 'All repositories are loaded.';

  return (
    <div className="space-y-3">
      <div
        ref={scrollContainerRef}
        className="max-h-80 w-full overflow-x-hidden overflow-y-auto pr-1"
        aria-live="polite"
        aria-busy={isLoading || isFetchingNextPage}
      >
        <ul className="w-full space-y-3">
          {repos.map((repo) => (
            <RepoListItem key={repo.id} repo={repo} />
          ))}
        </ul>
        <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
      </div>
      {showPaginationHints && (
        <div className="flex flex-col items-center py-2 text-xs text-slate-400">
          <div className="flex w-full items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span>{hintMessage}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
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

const RepoListItem = ({ repo }: { repo: GithubRepo }) => {
  const description = repo.description?.trim()
    ? repo.description
    : 'No description available';

  return (
    <li>
      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer noopener"
        className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className="truncate text-base font-semibold text-slate-900"
            title={repo.name}
          >
            {repo.name}
          </p>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500"
          title={`${repo.stargazers_count} stars`}
        >
          <span aria-hidden="true">★</span>
          <span aria-label={`${repo.stargazers_count} stars`}>
            {repo.stargazers_count}
          </span>
        </div>
      </a>
    </li>
  );
};
