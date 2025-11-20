import { lazy, Suspense, useMemo, useState } from 'react';
import type { GithubUser } from '../../types/github';

const UserReposList = lazy(() => import('../repos'));

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
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const visibleUsers = useMemo(() => users.slice(0, 5), [users]);

  const handleToggle = (userId: number) => {
    setExpandedUserId((current) => (current === userId ? null : userId));
  };

  return (
    <div className="mt-6 space-y-3">
      {isLoading && (
        <p className="text-sm text-slate-500">Searching users...</p>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          {error?.message ?? 'Something went wrong.'}
        </p>
      )}

      {trimmedQuery && !isLoading && !isError && (
        <p className="text-xs tracking-wide text-slate-400 uppercase">
          Showing users for “{trimmedQuery}”
        </p>
      )}

      {!isLoading && !isError && visibleUsers.length > 0 && (
        <ul className="space-y-3">
          {visibleUsers.map((user) => {
            const isExpanded = expandedUserId === user.id;

            return (
              <li key={user.id} className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleToggle(user.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                    isExpanded
                      ? 'bg-slate-100'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user.login}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tap to view repos
                      </p>
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
                  <div className="border-l border-slate-200 pl-4">
                    <Suspense
                      fallback={
                        <p className="text-sm text-slate-500">
                          Preparing repositories...
                        </p>
                      }
                    >
                      <UserReposList username={user.login} />
                    </Suspense>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {trimmedQuery && !isLoading && !isError && visibleUsers.length === 0 && (
        <p className="text-sm text-slate-500">No users found.</p>
      )}
    </div>
  );
};

export default UserSearchResults;
