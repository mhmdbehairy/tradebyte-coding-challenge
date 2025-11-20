import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { UserSearchResults } from './usersList';
import type { GithubUser } from '../../types/github';

const mockUserReposList = vi.fn();
vi.mock('../repos', () => ({
  __esModule: true,
  default: (props: { username: string }) => {
    mockUserReposList(props);
    return <div data-testid="user-repos">Repos for {props.username}</div>;
  },
}));

const baseUsers: GithubUser[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  login: `user-${index + 1}`,
  avatar_url: `https://avatars.githubusercontent.com/u/${index + 1}`,
  html_url: `https://github.com/user-${index + 1}`,
}));

const getProps = (
  overrides?: Partial<ComponentProps<typeof UserSearchResults>>
) => ({
  users: baseUsers,
  trimmedQuery: 'octocat',
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

describe('UserSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when searching', () => {
    render(<UserSearchResults {...getProps({ isLoading: true })} />);

    expect(screen.getByText(/Searching users/i)).toBeInTheDocument();
  });

  it('renders rate limit alert when applicable', () => {
    render(
      <UserSearchResults
        {...getProps({
          isError: true,
          error: new Error('API rate limit exceeded for IP.'),
        })}
      />
    );

    expect(screen.getByText(/GitHub rate limit reached/i)).toBeInTheDocument();
    expect(
      screen.getByText(/API rate limit exceeded for IP./i)
    ).toBeInTheDocument();
  });

  it('renders generic error when not rate limited', () => {
    render(
      <UserSearchResults
        {...getProps({ isError: true, error: new Error('Network down') })}
      />
    );

    expect(screen.getByText('Network down')).toBeInTheDocument();
  });

  it('shows trimmed query helper and limits visible users to five', () => {
    render(<UserSearchResults {...getProps()} />);

    expect(
      screen.getByText(/Search results for “octocat”/i)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('toggles repository list for a selected user', async () => {
    render(<UserSearchResults {...getProps()} />);

    const toggle = screen.getByRole('button', { name: /user-1/i });
    fireEvent.click(toggle);

    expect(await screen.findByTestId('user-repos')).toHaveTextContent(
      'Repos for user-1'
    );

    fireEvent.click(toggle);
    expect(screen.queryByTestId('user-repos')).not.toBeInTheDocument();
  });

  it('resets any expanded user when query changes', async () => {
    const { rerender } = render(<UserSearchResults {...getProps()} />);

    const toggle = screen.getByRole('button', { name: /user-1/i });
    fireEvent.click(toggle);

    expect(await screen.findByTestId('user-repos')).toHaveTextContent(
      'Repos for user-1'
    );

    rerender(
      <UserSearchResults {...getProps({ trimmedQuery: 'new-query' })} />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('user-repos')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no results match', () => {
    render(
      <UserSearchResults
        {...getProps({ users: [], trimmedQuery: 'test', isLoading: false })}
      />
    );

    expect(screen.getByText(/No users found/i)).toBeInTheDocument();
  });
});
