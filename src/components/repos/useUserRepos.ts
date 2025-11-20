import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserRepos } from '../../api';
import type { GithubRepo } from '../../types/github';

interface UseUserReposParams {
  username: string | null;
}

export const useUserRepos = ({ username }: UseUserReposParams) => {
  const trimmedUsername = username?.trim() ?? '';

  const pageSize = 10;

  return useInfiniteQuery<GithubRepo[], Error>({
    queryKey: ['user-repos', trimmedUsername],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getUserRepos(trimmedUsername, pageParam as number, pageSize),
    enabled: Boolean(trimmedUsername),
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length + 1 : undefined,
  });
};
