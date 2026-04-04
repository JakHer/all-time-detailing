import { NavLink } from 'react-router-dom';
import { navigationItems } from '../data/dashboard';

export function Sidebar() {
  return (
    <aside className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
          Studio premium
        </div>

        <div className="mt-6">
          <p className="text-sm text-stone-400">Panel operacyjny</p>
          <h1 className="mt-2 max-w-[12ch] text-4xl leading-none font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            All Time Detailing
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-stone-300">
            Elegancki system do zarządzania rezerwacjami, pojazdami, klientami i przepływem pracy studia.
          </p>
        </div>

        <nav className="mt-8 grid gap-2.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3.5 text-sm transition ${
                  isActive
                    ? 'border border-white/10 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border border-transparent text-stone-300 hover:border-white/10 hover:bg-white/6 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(214,158,46,0.16),rgba(255,255,255,0.05))] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Następny krok</p>
        <h2 className="mt-3 text-2xl leading-tight font-semibold text-white">Frontend gotowy na podpięcie Supabase</h2>
        <p className="mt-3 text-sm leading-7 text-stone-300">
          Logowanie, baza klientów, zdjęcia realizacji i statusy zleceń możemy dołożyć bez zmiany kierunku UI.
        </p>
      </div>
    </aside>
  );
}
