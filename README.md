## Tradebyte Coding Challenge

A Vite + React + TypeScript app that lets you search GitHub users, inspect their top repositories, and keep your UI in sync with the browser history so refresh/back/forward navigation never loses context.

### Live demo

- https://tradebyte-coding-challenge.vercel.app

### Getting started

1. Install dependencies: `npm install`
2. (Optional) create a `.env` with `VITE_GITHUB_TOKEN=<your-token>` to raise API limits during development.
3. Start Dev Server: `npm run dev` then open the printed localhost URL.

### Docker

1. Build the production image: `docker build -t tradebyte-app .`
2. Run the container: `docker run -p 8080:80 tradebyte-app`
3. Open http://localhost:8080 to view the nginx-served production bundle.

### Available scripts

- `npm run dev` – launch Vite dev server with hot reload
- `npm run build` – type-check and produce a production bundle
- `npm run preview` – preview the production bundle locally
- `npm run lint` – run eslint across the project
- `npm run format` – format the codebase with Prettier
- `npm run test` – execute the Vitest suite (uses jsdom + Testing Library)
- `npm run test:e2e` – run the Playwright browser tests (requires installed browsers)

### Feature highlights

- Debounced GitHub user search limited to five results for clarity
- Expandable repo panels with infinite scroll, rate-limit-aware messaging, and star counts
- URL param persistence: the `q` query param stores the search term and `expanded` tracks which user’s repos are open, enabling refresh/back/forward navigation to restore state automatically

### State, URL params, and caching

- **Local + URL state:** The top-level `App` component sources the search term from `useSearchParamState('q')`, so every keystroke updates both React state and `?q=` in the address bar. The same hook powers the expandable user cards via the `expanded` param, and it listens to `popstate` so browser navigation replays prior searches/expansions without extra code.
- **User intent tracking:** `useSearchParamState` reports whether the latest change came from the user, initial load, or browser history. `SearchPanel` uses that signal to decide when to push vs. replace history entries, avoiding noisy entries while still capturing “committed” searches.
- **Server cache via React Query:** `useSearchUsers` and `useUserRepos` wrap the GitHub API with `@tanstack/react-query`. Each query key (`['search-users', trimmedQuery]`, `['user-repos', username]`) keeps results warm for 30 seconds (`staleTime: 30_000`), disables refetch-on-focus, and skips execution until the input is non-empty (`enabled` flag).
- **Infinite repos + memoization:** Repository pages use `useInfiniteQuery` to fetch 10 at a time, automatically computing the next page param until GitHub signals completion. Returned pages are flattened and memoized, ensuring the UI reuses cached results when reopening a user panel.
- **Debounced fetches:** A lightweight `useDebounce` hook waits 400 ms after typing before triggering React Query, preventing unnecessary API calls while keeping the UI responsive.
- **No extra global store:** Redux or Context wasn’t added on purpose—React Query already owns the server cache, and the remaining UI state (search text, expanded card) is trivial to keep local. Introducing a global store would add surface area without solving a real problem here.

### Testing notes

The Vitest suite covers API helpers, hooks, and UI flows—including the URL persistence logic. Run `npm run test` before pushing changes to ensure regressions are caught early.

### Lighthouse audits

<img width="1792" height="860" alt="Screenshot 2025-11-20 at 21 45 51" src="https://github.com/user-attachments/assets/e692d819-975f-451d-9bbe-95f56a412595" />
<img width="1792" height="909" alt="Screenshot 2025-11-20 at 21 44 06" src="https://github.com/user-attachments/assets/7d8c59b6-c761-4dad-9717-c346815e62ea" />
