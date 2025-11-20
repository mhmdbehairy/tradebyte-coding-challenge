import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { GithubRepo, GithubSearchUsersResponse } from '../types/github';

const jsonResponse = (body: unknown, init: ResponseInit) =>
  new Response(JSON.stringify(body), init);

const loadApiModule = async (env?: Record<string, string>) => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_GITHUB_TOKEN', '');
  if (env) {
    for (const [key, value] of Object.entries(env)) {
      vi.stubEnv(key, value);
    }
  }

  return import('./index');
};

describe('handleGithubResponse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns parsed payload for ok responses', async () => {
    const { handleGithubResponse } = await loadApiModule();
    const response = jsonResponse({ ok: true }, { status: 200 });

    await expect(handleGithubResponse(response)).resolves.toEqual({ ok: true });
  });

  it('throws helpful message for rate-limit errors', async () => {
    const { handleGithubResponse } = await loadApiModule();
    const response = jsonResponse(
      { message: 'API rate limit exceeded for IP.' },
      { status: 403, statusText: 'Forbidden' }
    );

    await expect(handleGithubResponse(response)).rejects.toThrow(
      'GitHub API rate limit exceeded. Please try again later.'
    );
  });

  it('surfaces API error payload when available', async () => {
    const { handleGithubResponse } = await loadApiModule();
    const response = jsonResponse(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' }
    );

    await expect(handleGithubResponse(response)).rejects.toThrow(
      'GitHub API error (404): Not Found – Not Found'
    );
  });
});

describe('searchUsers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('short-circuits when query is blank', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { searchUsers } = await loadApiModule();

    await expect(searchUsers('   ')).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('hits GitHub search endpoint and returns items', async () => {
    const items = [
      {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        html_url: 'https://github.com/octocat',
      },
    ];
    const payload: GithubSearchUsersResponse = {
      incomplete_results: false,
      total_count: 1,
      items,
    };
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(payload, { status: 200 }));
    const { searchUsers } = await loadApiModule();

    const result = await searchUsers('octo cat');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.github.com/search/users?q=octo%20cat&per_page=5',
      undefined
    );
    expect(result).toEqual(items);
  });

  it('attaches Authorization header when token exists', async () => {
    const payload: GithubSearchUsersResponse = {
      incomplete_results: false,
      total_count: 1,
      items: [
        {
          login: 'octocat',
          id: 1,
          avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
          html_url: 'https://github.com/octocat',
        },
      ],
    };
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(payload, { status: 200 }));
    const { searchUsers } = await loadApiModule({
      VITE_GITHUB_TOKEN: 'secret',
    });

    await searchUsers('octocat');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.github.com/search/users?q=octocat&per_page=5',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
      })
    );
  });
});

describe('getUserRepos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns empty list when username is blank', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { getUserRepos } = await loadApiModule();

    await expect(getUserRepos('')).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('requests user repos endpoint with pagination details', async () => {
    const repos: GithubRepo[] = [
      {
        id: 1,
        name: 'repo',
        full_name: 'octocat/repo',
        html_url: 'https://github.com/octocat/repo',
        description: null,
        fork: false,
        stargazers_count: 1,
        language: 'TypeScript',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(repos, { status: 200 }));
    const { getUserRepos } = await loadApiModule();

    const result = await getUserRepos(' octocat ', 2, 5);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.github.com/users/octocat/repos?sort=updated&direction=desc&page=2&per_page=5',
      undefined
    );
    expect(result).toEqual(repos);
  });
});
