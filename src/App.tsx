import { useState } from 'react';
import { Layout, SearchPanel } from './components';

const App = () => {
  const [query, setQuery] = useState('');

  return (
    <Layout>
      <div className="space-y-6">
        <SearchPanel query={query} onQueryChange={setQuery} />
      </div>
    </Layout>
  );
};

export default App;
