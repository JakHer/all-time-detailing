import type { DashboardMetric } from '../../lib/dashboard';
import { Skeleton } from '../ui/Skeleton';

type DashboardHeroProps = {
  metrics?: DashboardMetric[];
  isLoading: boolean;
};

export function DashboardHero({ metrics, isLoading }: DashboardHeroProps) {
  const activeBookings =
    metrics?.find((m) => m.label === 'Auta dzisiaj')?.value || '0';

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03)_45%,rgba(214,158,46,0.12)_100%)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8 xl:p-10">
      <div className="pointer-events-none absolute -right-30 -top-20 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-35 right-[8%] h-72 w-72 rounded-full bg-white/8 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_360px] xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            System dla detailingu
          </p>
          <h2 className="mt-4 max-w-[11ch] text-5xl leading-[0.92] font-semibold tracking-[-0.05em] text-white sm:text-6xl xl:text-7xl">
            Mniej chaosu. Więcej kontroli nad każdym autem.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
            Budujemy panel, który wygląda nowocześnie i jednocześnie porządkuje
            dzień pracy studia: od przyjęcia auta, przez realizację usługi, aż
            po odbiór i historię klienta.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-linear-to-br from-amber-200 to-amber-400 px-5 py-3.5 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(214,158,46,0.25)]"
            >
              Dodaj rezerwację
            </button>
            <button
              type="button"
              className="rounded-full border border-white/12 bg-white/6 px-5 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Zobacz klientów
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[30px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Na dziś
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-6 w-32" />
              ) : (
                <p className="mt-1 text-lg font-semibold text-white">
                  {`${activeBookings} ${activeBookings === '1' ? 'aktywne zlecenie' : 'aktywne zlecenia'}`}
                </p>
              )}
            </div>
            <div className="rounded-full bg-emerald-400/14 px-3 py-1 text-xs font-semibold text-emerald-200">
              Status czasu rzeczywistego
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-26 rounded-2xl" />
                ))
              : metrics?.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-white/8 bg-white/6 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      {stat.detail}
                    </p>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
