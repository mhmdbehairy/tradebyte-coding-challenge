import { useState } from 'react';
import Layout from './components/layout/Layout';
import SearchPanel from './components/search/SearchPanel';
import type { GithubUser } from './types/github';

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<GithubUser | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <SearchPanel
          query={query}
          onQueryChange={setQuery}
          onUserSelect={(user) => setSelectedUser(user)}
        />
      </div>
    </Layout>
  );
};

export default App;
