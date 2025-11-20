import type { FormEvent } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchInput } from '../shared/searchInput';
import { UserSearchResults } from './usersList';
import { useSearchUsers } from './useSearchUsers';

export interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export const SearchPanel = ({ query, onQueryChange }: SearchPanelProps) => {
  const debouncedQuery = useDebounce(query, 400);
  const trimmedQuery = debouncedQuery.trim();
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useSearchUsers({ query: debouncedQuery });

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
      <UserSearchResults
        users={users}
        trimmedQuery={trimmedQuery}
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
      />
    </section>
  );
};

export default SearchPanel;
