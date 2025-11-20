import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useUserRepos } from './useUserRepos';
import { getUserRepos } from '../../api';
import type { GithubRepo } from '../../types/github';

vi.mock('../../api', () => ({
  getUserRepos: vi.fn(),
  REPOS_PAGE_SIZE: 10,
}));

const getUserReposMock = getUserRepos as unknown as Mock;

const createQueryClientWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const createRepos = (count: number, startId = 1): GithubRepo[] =>
  Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    return {
      id,
      name: `repo-${id}`,
      full_name: `octocat/repo-${id}`,
      html_url: `https://github.com/octocat/repo-${id}`,
      description: null,
      fork: false,
      stargazers_count: id,
      language: 'TypeScript',
      updated_at: '2024-01-01T00:00:00Z',
    };
  });

const createRepoWithStars = (id: number, stars: number): GithubRepo => ({
  id,
  name: `repo-${id}`,
  full_name: `octocat/repo-${id}`,
  html_url: `https://github.com/octocat/repo-${id}`,
  description: null,
  fork: false,
  stargazers_count: stars,
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
});

describe('useUserRepos', () => {
  beforeEach(() => {
    getUserReposMock.mockReset();
  });

  it('does not fetch when username is blank', async () => {
    const wrapper = createQueryClientWrapper();

    renderHook(() => useUserRepos({ username: '   ' }), { wrapper });

    await waitFor(() => {
      expect(getUserReposMock).not.toHaveBeenCalled();
    });
  });

  it('fetches repositories with correct pagination and supports fetchNextPage', async () => {
    const wrapper = createQueryClientWrapper();
    const firstPage = createRepos(10, 1);
    const secondPage = createRepos(3, 11);

    getUserReposMock
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHook(() => useUserRepos({ username: 'octocat' }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.repos).toHaveLength(10);
    });

    expect(getUserReposMock).toHaveBeenCalledWith('octocat', 1, 10);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
      expect(result.current.repos).toHaveLength(13);
    });

    expect(getUserReposMock).toHaveBeenCalledWith('octocat', 2, 10);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns a flattened list sorted by stargazers desc', async () => {
    const wrapper = createQueryClientWrapper();
    const firstPage = createRepos(10, 1);
    const secondPage = [createRepoWithStars(11, 50)];

    getUserReposMock
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHook(() => useUserRepos({ username: 'octocat' }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.repos).toHaveLength(10);
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.repos).toHaveLength(11);
      expect(result.current.repos[0].id).toBe(11);
      expect(result.current.repos[result.current.repos.length - 1].id).toBe(1);
    });
  });
});
