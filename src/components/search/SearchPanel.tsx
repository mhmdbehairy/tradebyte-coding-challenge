import type { FormEvent } from 'react';
import type { GithubUser } from '../../types/github';
import { useSearchUsers } from './useSearchUsers';

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  onUserSelect: (user: GithubUser) => void;
}

const SearchPanel = ({
  query,
  onQueryChange,
  onUserSelect,
}: SearchPanelProps) => {
  const trimmedQuery = query.trim();
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useSearchUsers({ query });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

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

        {!isLoading && !isError && users.length > 0 && (
          <ul className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => onUserSelect(user)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.login}
                    </p>
                    <p className="text-xs text-slate-500">View profile</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {trimmedQuery && !isLoading && !isError && users.length === 0 && (
          <p className="text-sm text-slate-500">No users found.</p>
        )}
      </div>
    </section>
  );
};

export default SearchPanel;
