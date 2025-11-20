import { useCallback } from 'react';
import { Layout, SearchPanel } from './components';
import { useSearchParamState } from './hooks/useSearchParamState';

const App = () => {
  const [query, setQueryParam, queryUpdateSource] = useSearchParamState('q', '');

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryParam(value, { history: 'replace' });
    },
    [setQueryParam]
  );

  const handleQueryCommit = useCallback(
    (value: string) => {
      setQueryParam(value, { history: 'push' });
    },
    [setQueryParam]
  );

  return (
    <Layout>
      <div className="space-y-6">
        <SearchPanel
          query={query}
          queryUpdateSource={queryUpdateSource}
          onQueryChange={handleQueryChange}
          onQueryCommit={handleQueryCommit}
        />
      </div>
    </Layout>
  );
};

export default App;
