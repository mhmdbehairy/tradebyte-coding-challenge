import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../api';
import type { GithubUser } from '../../types/github';

interface UseSearchUsersParams {
  query: string;
}

export const useSearchUsers = ({ query }: UseSearchUsersParams) => {
  const trimmedQuery = query.trim();

  return useQuery<GithubUser[], Error>({
    queryKey: ['search-users', trimmedQuery],
    queryFn: () => searchUsers(trimmedQuery),
    enabled: Boolean(trimmedQuery),
    staleTime: 30 * 1000,
  });
};
