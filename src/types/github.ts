export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GithubSearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}
