import {
  ArrowRight,
  CalendarPlus2,
  CarFront,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../ui/ActionButton';

const primaryAction = {
  title: 'Dodaj rezerwację',
  body: 'Przejdź do kalendarza i od razu otwórz formularz nowej wizyty.',
  icon: CalendarPlus2,
  to: '/rezerwacje?nowa=1',
};

const secondaryActions = [
  {
    title: 'Klienci',
    body: 'Historia wizyt i relacje',
    icon: Users,
    to: '/klienci',
  },
  {
    title: 'Usługi',
    body: 'Pakiety i katalog sprzedażowy',
    icon: Sparkles,
    to: '/uslugi',
  },
  {
    title: 'Pojazdy',
    body: 'Auta przypisane do klientów',
    icon: CarFront,
    to: '/pojazdy',
  },
] as const;

export function DashboardHero() {
  const navigate = useNavigate();

  return (
    <section className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.28)] md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szybkie akcje
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              Najczęstsze skróty dla recepcji i zespołu
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-300">
              Najważniejsze wejścia do aplikacji są już aktywne, więc z pulpitu
              można od razu przejść do pracy.
            </p>
          </div>

          <ActionButton
            icon={primaryAction.icon}
            onClick={() => navigate(primaryAction.to)}
          >
            {primaryAction.title}
          </ActionButton>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {secondaryActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.to)}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/6 px-4 py-4 text-left transition hover:border-white/16 hover:bg-white/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white">
                    <Icon className="h-4.5 w-4.5 opacity-90" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white">{action.title}</h4>
                    <p className="mt-1 text-sm text-stone-400">{action.body}</p>
                  </div>
                </div>

                <ArrowRight className="h-4.5 w-4.5 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
