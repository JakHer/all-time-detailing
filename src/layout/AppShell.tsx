import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0c0d] text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,158,46,0.24),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.09),transparent_18%),linear-gradient(135deg,#16120f_0%,#0d0f10_58%,#090909_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-50" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-375 flex-col px-4 py-4 lg:px-6 lg:py-6">
        <div className="grid flex-1 gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
          <Sidebar />
          <main className="grid gap-4">
            <Outlet />
          </main>
        </div>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(18, 19, 20, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f5f5f4',
          },
        }}
      />
    </div>
  );
}
