import {
  lazy,
  Suspense,
  type FormEvent,
  type SVGProps,
  useEffect,
  useRef,
} from 'react';
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
  const handleReset = () => {
    if (!query) {
      return;
    }

    onQueryChange('');
  };
  const canReset = query.trim().length > 0;
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label
          htmlFor="user-search"
          className="text-sm font-medium text-slate-600"
        >
          GitHub username
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            id="user-search"
            label="GitHub username"
            hideLabel
            value={query}
            onChange={onQueryChange}
            placeholder="e.g. gaearon"
            wrapperClassName="flex-1"
          />
          <button
            type="button"
            onClick={handleReset}
            disabled={!canReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-600 bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:border-rose-200 disabled:bg-rose-200 disabled:text-white/70 sm:w-auto"
          >
            <ResetIcon aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
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

const ResetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 3v6h6" />
    <path d="M3 9a9 9 0 1 0 3-6" />
  </svg>
);
