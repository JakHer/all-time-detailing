import * as Dialog from '@radix-ui/react-dialog';
import { CalendarPlus2, ChevronRight, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { navigationItems } from '../data/dashboard';
import { ActionButton } from '../components/ui/ActionButton';

type SidebarContentProps = {
  onNavigate?: () => void;
};

const appLabel = 'All Time Detailing';
const appDescription =
  'Elegancki system do zarządzania rezerwacjami, pojazdami, klientami i przepływem pracy studia.';

export function Sidebar() {
  return (
    <aside className="hidden xl:flex xl:flex-col">
      <SidebarCard />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentItem = getCurrentNavigationItem(location.pathname);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="xl:hidden">
        <div className="sticky top-0 z-40 -mx-1 rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,19,20,0.92),rgba(18,19,20,0.78))] px-3 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                aria-label="Otwórz menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </Dialog.Trigger>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Panel operacyjny
              </p>
              <p className="truncate text-sm font-medium text-white">
                {currentItem.label}
              </p>
            </div>

            <ActionButton
              icon={CalendarPlus2}
              className="shrink-0 px-4"
              onClick={() => navigate('/rezerwacje?nowa=1')}
            >
              Rezerwacja
            </ActionButton>
          </div>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/72 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 xl:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-60 w-[min(88vw,380px)] outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left xl:hidden">
            <div className="h-full p-3">
              <SidebarCard
                className="h-full"
                onNavigate={() => setOpen(false)}
                closeButton={
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                      aria-label="Zamknij menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                }
                headerAction={
                  <ActionButton
                    icon={CalendarPlus2}
                    className="w-full justify-center"
                    onClick={() => {
                      setOpen(false);
                      navigate('/rezerwacje?nowa=1');
                    }}
                  >
                    Dodaj rezerwację
                  </ActionButton>
                }
                isMobile
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </div>
    </Dialog.Root>
  );
}

function SidebarCard({
  className = '',
  onNavigate,
  closeButton,
  headerAction,
  isMobile = false,
}: {
  className?: string;
  onNavigate?: () => void;
  closeButton?: ReactNode;
  headerAction?: ReactNode;
  isMobile?: boolean;
}) {
  return (
    <div
      className={`flex flex-col overflow-y-auto rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
          Studio premium
        </div>
        {closeButton}
      </div>

      <div className="mt-6">
        <p className="text-sm text-stone-400">Panel operacyjny</p>
        <h1 className="mt-2 max-w-[12ch] text-4xl leading-none font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          {appLabel}
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-stone-300">
          {appDescription}
        </p>
      </div>

      {headerAction ? <div className="mt-6">{headerAction}</div> : null}

      <nav className="mt-8 grid gap-2.5">
        <SidebarContent onNavigate={onNavigate} />
      </nav>

      {isMobile ? (
        <div className="mt-auto pt-6">
          <div className="rounded-3xl border border-white/8 bg-black/18 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Szybki dostęp
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Menu otwiera się z lewej, a najważniejsza akcja jest stale pod
              ręką bez zasłaniania treści.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <>
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm transition ${
              isActive
                ? 'border border-white/10 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border border-transparent text-stone-300 hover:border-white/10 hover:bg-white/6 hover:text-white'
            }`
          }
        >
          <span>{item.label}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
        </NavLink>
      ))}
    </>
  );
}

function getCurrentNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) =>
      item.to === '/'
        ? pathname === '/'
        : pathname.startsWith(item.to),
    ) ?? navigationItems[0]
  );
}
