import type {
  GithubUser,
  GithubRepo,
  GithubSearchUsersResponse,
} from '../types/github';

export const GITHUB_API_BASE_URL = 'https://api.github.com';

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

  const url = `${GITHUB_API_BASE_URL}/search/users?q=${encodeURIComponent(
    trimmed
  )}&per_page=5`;

  const response = await fetch(url, withAuthHeaders());
  const data = await handleGithubResponse<GithubSearchUsersResponse>(response);

  return data.items;
};

export const getUserRepos = async (
  username: string,
  page = 1,
  perPage = 10
): Promise<GithubRepo[]> => {
  const trimmed = username.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    sort: 'updated',
    direction: 'desc',
    page: String(page),
    per_page: String(perPage),
  });

  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(
    trimmed
  )}/repos?${params.toString()}`;

  const response = await fetch(url, withAuthHeaders());
  return handleGithubResponse<GithubRepo[]>(response);
};
