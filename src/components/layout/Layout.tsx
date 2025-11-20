import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
    <main className="mx-auto w-full max-w-4xl rounded-3xl bg-white/95 p-8 shadow-2xl">
      <header className="mb-8 space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900">GitHub Explorer</h1>
        <p className="text-base text-slate-500">
          Search for GitHub users and explore their public repositories.
        </p>
      </header>
      <div className="space-y-6">{children}</div>
    </main>
  </div>
);

export default Layout;
