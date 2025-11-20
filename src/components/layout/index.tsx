import type { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-slate-900 px-0 py-0 sm:px-6 sm:py-8 lg:px-8">
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col rounded-none bg-white p-6 shadow-2xl sm:min-h-0 sm:rounded-3xl sm:p-8">
      <header className="mb-8 space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900">GitHub Explorer</h1>
        <p className="text-base text-slate-600">
          Search for GitHub users and explore their public repositories.
        </p>
      </header>
      <div className="space-y-6">{children}</div>
    </main>
  </div>
);

export default Layout;
