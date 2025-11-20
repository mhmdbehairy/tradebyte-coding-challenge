import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserRepos, REPOS_PAGE_SIZE } from '../../api';
import type { GithubRepo } from '../../types/github';

interface UseUserReposParams {
  username: string | null;
}

export const useUserRepos = ({ username }: UseUserReposParams) => {
  const trimmedUsername = username?.trim() ?? '';

  const pageSize = REPOS_PAGE_SIZE;

  const query = useInfiniteQuery<GithubRepo[], Error>({
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

  const repos = useMemo(() => {
    if (!query.data?.pages.length) {
      return [] as GithubRepo[];
    }

    const flattened = query.data.pages.flatMap((page) => page);
    return [...flattened].sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );
  }, [query.data]);

  return {
    ...query,
    repos,
  };
};
