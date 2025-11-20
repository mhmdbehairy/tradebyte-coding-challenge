import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SearchPanel } from './index';

vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockUseSearchUsers = vi.fn();
vi.mock('./useSearchUsers', () => ({
  useSearchUsers: (params: { query: string }) => mockUseSearchUsers(params),
}));

const mockUserResults = vi.fn();
vi.mock('./usersList', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockUserResults(props);
    return <div data-testid="user-results" />;
  },
}));

describe('SearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchUsers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders the search input and forwards changes', () => {
    const handleChange = vi.fn();

    render(<SearchPanel query="" onQueryChange={handleChange} />);

    const input = screen.getByLabelText(/GitHub username/i);
    fireEvent.change(input, { target: { value: 'octocat' } });

    expect(handleChange).toHaveBeenCalledWith('octocat');
  });

  it('passes debounced query to the user search hook', () => {
    render(<SearchPanel query="octocat" onQueryChange={() => {}} />);

    expect(mockUseSearchUsers).toHaveBeenCalledWith({ query: 'octocat' });
  });

  it('hands hook state down to the results component', async () => {
    const users = [
      {
        login: 'octocat',
        id: 1,
        avatar_url: 'https://avatars.githubusercontent.com/u/1',
        html_url: 'https://github.com/octocat',
      },
    ];
    mockUseSearchUsers.mockReturnValue({
      data: users,
      isLoading: true,
      isError: true,
      error: new Error('Network'),
    });

    render(<SearchPanel query="octo" onQueryChange={() => {}} />);

    await screen.findByTestId('user-results');

    expect(mockUserResults).toHaveBeenCalledWith(
      expect.objectContaining({
        users,
        trimmedQuery: 'octo',
        isLoading: true,
        isError: true,
      })
    );
  });
});
