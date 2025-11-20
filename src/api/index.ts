import type {
  GithubUser,
  GithubRepo,
  GithubSearchUsersResponse,
} from '../types/github';

export const GITHUB_API_BASE_URL = 'https://api.github.com';

export const handleGithubResponse = async <T>(
  response: Response
): Promise<T> => {
  if (!response.ok) {
    let errorMsg = `GitHub API error (${response.status}): ${response.statusText}`;
    try {
      const data = await response.json();
      if (data?.message) {
        errorMsg += ` – ${data.message}`;
      }
    } catch {
      // Ignore JSON parsing errors
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
};

export const searchUsers = async (query: string): Promise<GithubUser[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${GITHUB_API_BASE_URL}/search/users?q=${encodeURIComponent(
    trimmed
  )}&per_page=5`;

  const response = await fetch(url);
  const data = await handleGithubResponse<GithubSearchUsersResponse>(response);

  return data.items;
};

export const getUserRepos = async (username: string): Promise<GithubRepo[]> => {
  const trimmed = username.trim();
  if (!trimmed) return [];

  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(
    trimmed
  )}/repos?sort=updated&direction=desc`;

  const response = await fetch(url);
  return handleGithubResponse<GithubRepo[]>(response);
};
