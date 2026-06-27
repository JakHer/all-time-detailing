import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { actionCards } from '../../data/dashboard';
import type { FeaturedService } from '../../lib/dashboard';
import { useOpenGlobalBookingModal } from '../../lib/useOpenGlobalBookingModal';
import { Skeleton } from '../primitives/Skeleton';

type HighlightsColumnProps = {
  featuredServices?: FeaturedService[];
  isLoading: boolean;
};

export function HighlightsColumn({
  featuredServices,
  isLoading,
}: HighlightsColumnProps) {
  const navigate = useNavigate();
  const openBookingModal = useOpenGlobalBookingModal();
  const services = featuredServices ?? [];

  return (
    <div className="grid gap-4">
      <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(214,158,46,0.14),rgba(255,255,255,0.04))] p-5 shadow-lg sm:rounded-4xl sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/60 sm:text-xs sm:text-amber-200">
          Aktywne uslugi
        </p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:mt-2 sm:text-3xl sm:tracking-[-0.04em]">
          Katalog uslug
        </h3>
        <p className="mt-2 hidden text-sm leading-7 text-stone-300 sm:block sm:mt-3">
          Szybki podglad aktywnych uslug, ktore recepcja moze od razu wybrac w
          rezerwacji.
        </p>

        <div className="mt-4 grid gap-2 sm:mt-6 sm:gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-2xl sm:h-26 sm:rounded-3xl"
              />
            ))
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-6 text-sm leading-7 text-stone-400 sm:rounded-3xl sm:py-8">
              Brak aktywnych uslug w katalogu.
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.name}
                className="rounded-2xl border border-white/8 bg-black/18 p-3 sm:rounded-3xl sm:p-4"
              >
                <h4 className="text-base font-semibold text-white sm:text-lg">
                  {service.name}
                </h4>
                <p className="mt-1 hidden text-xs leading-relaxed text-stone-400 sm:mt-2 sm:block sm:text-sm sm:leading-7 sm:text-stone-300">
                  {service.description}
                </p>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="hidden rounded-4xl border border-white/10 bg-white/6 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Szybkie sekcje
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Moduly, ktore sa juz gotowe do uzycia
        </h3>

        <div className="mt-6 grid gap-3">
          {actionCards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() =>
                card.to === '/rezerwacje?nowa=1'
                  ? openBookingModal()
                  : navigate(card.to)
              }
              className={`group rounded-3xl border border-white/8 bg-linear-to-br ${card.tone} p-4 text-left transition hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {card.title}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-stone-300">
                    {card.body}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-white/60 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}
