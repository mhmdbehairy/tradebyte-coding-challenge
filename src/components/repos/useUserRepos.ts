import { useQuery } from '@tanstack/react-query';
import { getUserRepos } from '../../api';
import type { GithubRepo } from '../../types/github';

interface UseUserReposParams {
  username: string | null;
}

export const useUserRepos = ({ username }: UseUserReposParams) => {
  const trimmedUsername = username?.trim() ?? '';

  return useQuery<GithubRepo[], Error>({
    queryKey: ['user-repos', trimmedUsername],
    queryFn: () => getUserRepos(trimmedUsername),
    enabled: Boolean(trimmedUsername),
    staleTime: 30 * 1000,
  });
};
