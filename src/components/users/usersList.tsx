import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import type { GithubUser } from '../../types/github';
import RateLimitAlert from '../shared/rateLimitAlert';
import { useSearchParamState } from '../../hooks/useSearchParamState';

const UserReposList = lazy(() => import('../repos'));
const MAX_VISIBLE_USERS = 5;

const isRateLimitError = (incoming: Error | null) =>
  typeof incoming?.message === 'string' &&
  incoming.message.toLowerCase().includes('rate limit');

export interface UserSearchResultsProps {
  users: GithubUser[];
  trimmedQuery: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const UserSearchResults = ({
  users,
  trimmedQuery,
  isLoading,
  isError,
  error,
}: UserSearchResultsProps) => {
  const [expandedLogin, setExpandedLogin] = useSearchParamState(
    'expanded',
    ''
  );
  const queryKeyRef = useRef(trimmedQuery);
  const visibleUsers = useMemo(
    () => users.slice(0, MAX_VISIBLE_USERS),
    [users]
  );
  const showResults = !isLoading && !isError && visibleUsers.length > 0;
  const showEmptyState =
    trimmedQuery && !isLoading && !isError && visibleUsers.length === 0;

  useEffect(() => {
    if (queryKeyRef.current === trimmedQuery) {
      return;
    }

    queryKeyRef.current = trimmedQuery;

    if (expandedLogin) {
      setExpandedLogin('', { history: 'replace' });
    }
  }, [expandedLogin, setExpandedLogin, trimmedQuery]);

  const handleToggle = (userLogin: string) => {
    const nextValue = expandedLogin === userLogin ? '' : userLogin;
    setExpandedLogin(nextValue, { history: 'push' });
  };

  return (
    <div className="mt-6 space-y-3">
      {isLoading && (
        <p className="text-sm text-slate-500">Searching users...</p>
      )}

      {isError &&
        (isRateLimitError(error) ? (
          <RateLimitAlert message={error?.message} />
        ) : (
          <p className="text-sm text-red-500">
            {error?.message ?? 'Something went wrong.'}
          </p>
        ))}

      {trimmedQuery && !isLoading && !isError && (
        <p
          className="text-xs tracking-wide text-slate-400 uppercase"
          aria-live="polite"
        >
          Search results for “{trimmedQuery}”
        </p>
      )}

      {showResults && (
        <ul className="space-y-3">
          {visibleUsers.map((user) => {
            const isExpanded = expandedLogin === user.login;
            const detailsId = `user-repos-${user.id}`;

            return (
              <UserResultCard
                key={user.id}
                user={user}
                isExpanded={isExpanded}
                detailsId={detailsId}
                onToggle={() => handleToggle(user.login)}
              />
            );
          })}
        </ul>
      )}

      {showEmptyState && (
        <p className="text-sm text-slate-500" aria-live="polite">
          No users found.
        </p>
      )}
    </div>
  );
};

export default UserSearchResults;

interface UserResultCardProps {
  user: GithubUser;
  isExpanded: boolean;
  detailsId: string;
  onToggle: () => void;
}

const UserResultCard = ({
  user,
  isExpanded,
  detailsId,
  onToggle,
}: UserResultCardProps) => (
  <li className="space-y-3">
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
        isExpanded ? 'bg-slate-100' : 'bg-slate-50 hover:bg-slate-100'
      }`}
      aria-expanded={isExpanded}
      aria-controls={detailsId}
    >
      <div className="flex items-center gap-3">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">{user.login}</p>
          <p className="text-xs text-slate-500">Tap to view repos</p>
        </div>
      </div>
      <span
        className={`text-lg text-slate-400 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}
        aria-hidden="true"
      >
        ▾
      </span>
    </button>

    {isExpanded && (
      <div
        id={detailsId}
        className="border-l border-slate-200 pl-4"
        role="region"
        aria-label={`Repositories for ${user.login}`}
      >
        <Suspense
          fallback={
            <p className="text-sm text-slate-500">Preparing repositories...</p>
          }
        >
          <UserReposList username={user.login} />
        </Suspense>
      </div>
    )}
  </li>
);
