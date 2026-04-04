import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0c0d] text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,158,46,0.24),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.09),transparent_18%),linear-gradient(135deg,#16120f_0%,#0d0f10_58%,#090909_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-50" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 lg:px-6 lg:py-6">
        <div className="grid flex-1 gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
          <Sidebar />
          <main className="grid gap-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
