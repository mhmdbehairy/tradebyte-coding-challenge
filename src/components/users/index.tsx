import { lazy, Suspense, type FormEvent, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchParamUpdateSource } from '../../hooks/useSearchParamState';
import { SearchInput } from '../shared/searchInput';
import { useSearchUsers } from './useSearchUsers';

const UserSearchResults = lazy(() => import('./usersList'));

export interface SearchPanelProps {
  query: string;
  queryUpdateSource?: SearchParamUpdateSource;
  onQueryChange: (value: string) => void;
  onQueryCommit?: (value: string) => void;
}

export const SearchPanel = ({
  query,
  queryUpdateSource = 'initial',
  onQueryChange,
  onQueryCommit,
}: SearchPanelProps) => {
  const debouncedQuery = useDebounce(query, 400);
  const trimmedQuery = debouncedQuery.trim();
  const { users, isLoading, isError, error } = useSearchUsers({
    query: debouncedQuery,
  });
  const committedQueryRef = useRef(trimmedQuery);

  useEffect(() => {
    const isUserInitiated = queryUpdateSource === 'user';

    if (!isUserInitiated || !onQueryCommit) {
      committedQueryRef.current = trimmedQuery;
      return;
    }

    if (committedQueryRef.current === trimmedQuery) {
      return;
    }

    onQueryCommit(debouncedQuery);
    committedQueryRef.current = trimmedQuery;
  }, [debouncedQuery, onQueryCommit, queryUpdateSource, trimmedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SearchInput
          id="user-search"
          label="GitHub username"
          value={query}
          onChange={onQueryChange}
          placeholder="e.g. gaearon"
        />
      </form>
      <Suspense
        fallback={
          <p className="mt-6 text-sm text-slate-500">Loading results...</p>
        }
      >
        <UserSearchResults
          users={users}
          trimmedQuery={trimmedQuery}
          isLoading={isLoading}
          isError={isError}
          error={error ?? null}
        />
      </Suspense>
    </section>
  );
};

export default SearchPanel;
