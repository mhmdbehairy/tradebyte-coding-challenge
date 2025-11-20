import type {
  GithubUser,
  GithubRepo,
  GithubSearchUsersResponse,
} from '../types/github';

export const GITHUB_API_BASE_URL = 'https://api.github.com';
const SEARCH_PAGE_SIZE = 5;
export const REPOS_PAGE_SIZE = 10;

const githubToken = import.meta.env.PROD
  ? undefined
  : import.meta.env.VITE_GITHUB_TOKEN;
const shouldAttachToken = Boolean(githubToken);

const withAuthHeaders = (init?: RequestInit): RequestInit | undefined => {
  if (!shouldAttachToken) {
    return init;
  }

  return {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${githubToken}`,
    },
  };
};

const requestGithub = async <T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(
    `${GITHUB_API_BASE_URL}${endpoint}`,
    withAuthHeaders(init)
  );

  return handleGithubResponse<T>(response);
};

export const handleGithubResponse = async <T>(
  response: Response
): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let apiMessage: string | undefined;
  let isRateLimitError = false;

  try {
    const data = await response.json();
    if (typeof data?.message === 'string') {
      apiMessage = data.message;
      if (
        response.status === 403 &&
        data.message.toLowerCase().includes('rate limit')
      ) {
        isRateLimitError = true;
      }
    }
  } catch {
    // Ignore JSON parsing errors
  }

  if (isRateLimitError) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }

  let errorMsg = `GitHub API error (${response.status}): ${response.statusText}`;
  if (apiMessage) {
    errorMsg += ` – ${apiMessage}`;
  }

  throw new Error(errorMsg);
};

export const searchUsers = async (query: string): Promise<GithubUser[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await requestGithub<GithubSearchUsersResponse>(
    `/search/users?q=${encodeURIComponent(trimmed)}&per_page=${SEARCH_PAGE_SIZE}`
  );

  return data.items;
};

export const getUserRepos = async (
  username: string,
  page = 1,
  perPage = REPOS_PAGE_SIZE
): Promise<GithubRepo[]> => {
  const trimmed = username.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    sort: 'updated',
    direction: 'desc',
    page: String(page),
    per_page: String(perPage),
  });

  return requestGithub<GithubRepo[]>(
    `/users/${encodeURIComponent(trimmed)}/repos?${params.toString()}`
  );
};
