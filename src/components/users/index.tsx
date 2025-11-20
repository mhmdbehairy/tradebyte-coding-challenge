import { useState, type FormEvent } from 'react';
import { useSearchUsers } from './useSearchUsers';
import { UserReposList } from '../repos';

export interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export const SearchPanel = ({ query, onQueryChange }: SearchPanelProps) => {
  const trimmedQuery = query.trim();
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useSearchUsers({ query });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleToggle = (userId: number) => {
    setExpandedUserId((current) => (current === userId ? null : userId));
  };

  const visibleUsers = users.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="user-search"
            className="text-sm font-medium text-slate-600"
          >
            GitHub username
          </label>
          <input
            id="user-search"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="e.g. gaearon"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>
      </form>

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
                      <UserReposList username={user.login} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {trimmedQuery &&
          !isLoading &&
          !isError &&
          visibleUsers.length === 0 && (
            <p className="text-sm text-slate-500">No users found.</p>
          )}
      </div>
    </section>
  );
};

export default SearchPanel;
