import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  beforeAll,
  vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserReposList } from './index';
import type { GithubRepo } from '../../types/github';

const mockUseUserRepos = vi.fn();
vi.mock('./useUserRepos', () => ({
  useUserRepos: (params: { username: string | null }) =>
    mockUseUserRepos(params),
}));

const createRepo = (
  id: number,
  stars: number,
  overrides?: Partial<GithubRepo>
): GithubRepo => ({
  id,
  name: `repo-${id}`,
  full_name: `octocat/repo-${id}`,
  html_url: `https://github.com/octocat/repo-${id}`,
  description: overrides?.description ?? null,
  fork: false,
  stargazers_count: stars,
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const defaultHookState = (overrides?: Record<string, unknown>) => ({
  data: { pages: [[]] },
  repos: [],
  isLoading: false,
  isError: false,
  error: null,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  ...overrides,
});

const originalIntersectionObserver = globalThis.IntersectionObserver;

beforeAll(() => {
  class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '0px';
    readonly thresholds = [] as number[];
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;

    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      this.callback = callback;
      this.options = options;
    }

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  globalThis.IntersectionObserver =
    IntersectionObserverMock as typeof IntersectionObserver;
});

afterAll(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver;
});

describe('UserReposList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserRepos.mockReturnValue(defaultHookState());
  });

  it('renders nothing when username is blank', () => {
    const { container } = render(<UserReposList username="   " />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders rate limit alert when API limit is hit', () => {
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        isError: true,
        error: new Error('API rate limit exceeded for IP.'),
      })
    );

    render(<UserReposList username="octocat" />);

    expect(screen.getByText(/GitHub rate limit reached/i)).toBeInTheDocument();
    expect(
      screen.getByText(/API rate limit exceeded for IP./i)
    ).toBeInTheDocument();
  });

  it('renders generic error for non rate-limit failures', () => {
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        isError: true,
        error: new Error('Network down'),
      })
    );

    render(<UserReposList username="octocat" />);

    expect(screen.getByText('Network down')).toBeInTheDocument();
  });

  it('shows loader while repositories are loading', () => {
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        isLoading: true,
        data: { pages: [[]] },
      })
    );

    render(<UserReposList username="octocat" />);

    expect(screen.getByText(/Loading repositories/i)).toBeInTheDocument();
  });

  it('shows empty state when no repositories are found', () => {
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        data: { pages: [[]] },
      })
    );

    render(<UserReposList username="octocat" />);

    expect(
      screen.getByText(/No public repositories found/i)
    ).toBeInTheDocument();
  });

  it('renders repositories returned by the hook', () => {
    const lower = createRepo(1, 2, { name: 'repo-b' });
    const higher = createRepo(2, 5, { name: 'repo-a' });
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        data: { pages: [[lower, higher]] },
        repos: [higher, lower],
      })
    );

    render(<UserReposList username="octocat" />);

    const repoLinks = screen.getAllByRole('link');
    expect(repoLinks[0]).toHaveTextContent('repo-a');
    expect(repoLinks[1]).toHaveTextContent('repo-b');
  });

  it('shows "All repositories are loaded" when pagination is complete', () => {
    const repo = createRepo(1, 1);
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        data: { pages: [[repo]] },
        repos: [repo],
        hasNextPage: false,
        isFetchingNextPage: false,
      })
    );

    render(<UserReposList username="octocat" />);

    expect(
      screen.getByText(/All repositories are loaded/i)
    ).toBeInTheDocument();
  });

  it('shows loading hint when fetching next page', () => {
    const repo = createRepo(1, 1);
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        data: { pages: [[repo]] },
        repos: [repo],
        isFetchingNextPage: true,
        hasNextPage: true,
      })
    );

    render(<UserReposList username="octocat" />);

    expect(screen.getByText(/Loading more repositories/i)).toBeInTheDocument();
  });

  it('falls back to a default description when missing', () => {
    const repo = createRepo(1, 1, { description: '' });
    mockUseUserRepos.mockReturnValue(
      defaultHookState({
        data: { pages: [[repo]] },
        repos: [repo],
      })
    );

    render(<UserReposList username="octocat" />);

    expect(screen.getByText(/No description available/i)).toBeInTheDocument();
  });
});
