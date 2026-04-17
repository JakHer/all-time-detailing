import {
  ArrowRight,
  CalendarPlus2,
  CarFront,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOpenGlobalBookingModal } from '../../lib/useOpenGlobalBookingModal';
import { ActionButton } from '../ui/ActionButton';

const primaryAction = {
  title: 'Dodaj rezerwacje',
  body: 'Przejdz do kalendarza i od razu otworz formularz nowej wizyty.',
  icon: CalendarPlus2,
};

const secondaryActions = [
  {
    title: 'Klienci',
    body: 'Historia wizyt i relacje',
    icon: Users,
    to: '/klienci',
  },
  {
    title: 'Uslugi',
    body: 'Pakiety i katalog sprzedazowy',
    icon: Sparkles,
    to: '/uslugi',
  },
  {
    title: 'Pojazdy',
    body: 'Auta przypisane do klientow',
    icon: CarFront,
    to: '/pojazdy',
  },
] as const;

export function DashboardHero() {
  const navigate = useNavigate();
  const openBookingModal = useOpenGlobalBookingModal();

  return (
    <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 shadow-lg sm:rounded-4xl sm:p-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szybkie akcje
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              Najczestsze skroty dla recepcji i zespolu
            </h3>
          </div>

          <ActionButton
            icon={primaryAction.icon}
            onClick={openBookingModal}
            className="hidden! sm:inline-flex! sm:w-auto"
          >
            {primaryAction.title}
          </ActionButton>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          {secondaryActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.to)}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-left transition hover:border-white/16 hover:bg-white/10 sm:rounded-3xl sm:px-4 sm:py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white sm:h-11 sm:w-11 sm:rounded-2xl">
                    <Icon className="h-4 w-4 opacity-90 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white sm:text-base">
                      {action.title}
                    </h4>
                    <p className="mt-0.5 truncate text-xs text-stone-400 sm:mt-1 sm:text-sm">
                      {action.body}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white sm:h-4.5 sm:w-4.5" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
