import { useUserRepos } from './useUserRepos';

export interface UserReposListProps {
  username: string | null;
}

export const UserReposList = ({ username }: UserReposListProps) => {
  const {
    data: repos = [],
    isLoading,
    isError,
    error,
  } = useUserRepos({ username });
  const trimmedUsername = username?.trim() ?? '';

  if (!trimmedUsername) {
    return null;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading repositories...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        {error?.message ?? 'Unable to load repositories.'}
      </p>
    );
  }

  if (repos.length === 0) {
    return (
      <p className="text-sm text-slate-500">No public repositories found.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {repos.map((repo) => (
        <li key={repo.id}>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
          >
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold text-slate-900">
                {repo.name}
              </p>
              {repo.description && (
                <p className="text-sm text-slate-600">{repo.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
              <span aria-hidden="true">★</span>
              <span>{repo.stargazers_count}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default UserReposList;
