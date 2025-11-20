import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../api';
import type { GithubUser } from '../../types/github';

interface UseSearchUsersParams {
  query: string;
}

export const useSearchUsers = ({ query }: UseSearchUsersParams) => {
  const trimmedQuery = query.trim();
  const hasQuery = Boolean(trimmedQuery);

  const queryResult = useQuery<GithubUser[], Error>({
    queryKey: ['search-users', trimmedQuery],
    queryFn: () => searchUsers(trimmedQuery),
    enabled: hasQuery,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...queryResult,
    users: queryResult.data ?? [],
  };
};
