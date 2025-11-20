## Tradebyte Coding Challenge

A Vite + React + TypeScript app that lets you search GitHub users, inspect their top repositories, and keep your UI in sync with the browser history so refresh/back/forward navigation never loses context.

### Tech stack
- React 19 with functional components and hooks
- Vite for local dev and builds
- TypeScript for type safety
- @tanstack/react-query for data fetching/caching
- Tailwind utility classes for styling
- Vitest + Testing Library for unit tests

### Getting started
1. Install dependencies: `npm install`
2. (Optional) create a `.env` with `VITE_GITHUB_TOKEN=<your-token>` to raise API limits during development.
3. Start Dev Server: `npm run dev` then open the printed localhost URL.

### Available scripts
- `npm run dev` – launch Vite dev server with hot reload
- `npm run build` – type-check and produce a production bundle
- `npm run preview` – preview the production bundle locally
- `npm run lint` – run eslint across the project
- `npm run format` – format the codebase with Prettier
- `npm run test` – execute the Vitest suite (uses jsdom + Testing Library)

### Feature highlights
- Debounced GitHub user search limited to five results for clarity
- Expandable repo panels with infinite scroll, rate-limit-aware messaging, and star counts
- URL param persistence: the `q` query param stores the search term and `expanded` tracks which user’s repos are open, enabling refresh/back/forward navigation to restore state automatically

### Testing notes
The Vitest suite covers API helpers, hooks, and UI flows—including the URL persistence logic. Run `npm run test` before pushing changes to ensure regressions are caught early.
