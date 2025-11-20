import { test, expect, Page, Route } from '@playwright/test';
import type { GithubRepo, GithubUser } from '../src/types/github';

const mockUsers: GithubUser[] = [
  {
    login: 'octocat',
    id: 1,
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    html_url: 'https://github.com/octocat',
  },
  {
    login: 'hubot',
    id: 2,
    avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
    html_url: 'https://github.com/hubot',
  },
];

const mockRepos: Record<string, GithubRepo[]> = {
  octocat: [
    {
      id: 101,
      name: 'hello-world',
      full_name: 'octocat/hello-world',
      html_url: 'https://github.com/octocat/hello-world',
      description: 'Sample project used for smoke tests.',
      fork: false,
      stargazers_count: 123,
      language: 'TypeScript',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ],
};

const respondJson = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(body),
  });

const mockSearchApi = async (page: Page) => {
  await page.route('**/search/users**', async (route) => {
    const url = new URL(route.request().url());
    const query = (url.searchParams.get('q') ?? '').toLowerCase();

    if (query.includes('octo')) {
      await respondJson(route, {
        total_count: mockUsers.length,
        incomplete_results: false,
        items: mockUsers,
      });
      return;
    }

    if (query.includes('rate')) {
      await respondJson(route, { message: 'API rate limit exceeded' }, 403);
      return;
    }

    await respondJson(route, {
      total_count: 0,
      incomplete_results: false,
      items: [],
    });
  });
};

const mockReposApi = async (page: Page) => {
  await page.route('**/users/*/repos**', async (route) => {
    const url = new URL(route.request().url());
    const pathParts = url.pathname.split('/');
    const username = pathParts[2]?.toLowerCase() ?? '';
    const repos = mockRepos[username] ?? [];
    await respondJson(route, repos);
  });
};

test.describe('GitHub Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await mockSearchApi(page);
    await mockReposApi(page);
  });

  test('searches for users and displays repositories', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('GitHub username');
    await input.fill('octocat');

    const expandButton = page.getByRole('button', { name: /octocat/i });
    await expect(expandButton).toBeVisible();

    await expandButton.click();

    await expect(
      page.getByRole('link', { name: /hello-world/i })
    ).toBeVisible();
  });

  test('shows empty state when no users match search term', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('GitHub username');
    await input.fill('empty user');

    await expect(page.getByText('No users found')).toBeVisible();
  });

  test('renders rate limit message when API returns 403', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('GitHub username');
    await input.fill('rate limit test');

    await expect(page.getByText('GitHub rate limit reached')).toBeVisible();
  });
});
