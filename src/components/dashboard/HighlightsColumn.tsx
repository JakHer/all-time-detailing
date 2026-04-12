import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { actionCards } from '../../data/dashboard';
import type { FeaturedService } from '../../lib/dashboard';
import { Skeleton } from '../ui/Skeleton';

type HighlightsColumnProps = {
  featuredServices?: FeaturedService[];
  isLoading: boolean;
};

export function HighlightsColumn({
  featuredServices,
  isLoading,
}: HighlightsColumnProps) {
  const navigate = useNavigate();
  const services = featuredServices ?? [];

  return (
    <div className="grid gap-4">
      <article className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(214,158,46,0.14),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Flagowe usługi
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Oferta, którą warto pokazać lepiej
        </h3>

        <div className="mt-6 grid gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-26 rounded-3xl" />
            ))
          ) : services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-sm leading-7 text-stone-400">
              Brak aktywnych usług w katalogu.
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.name}
                className="rounded-3xl border border-white/8 bg-black/18 p-4"
              >
                <h4 className="text-lg font-semibold text-white">
                  {service.name}
                </h4>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  {service.description}
                </p>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Szybkie sekcje
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Moduły, które są już gotowe do użycia
        </h3>

        <div className="mt-6 grid gap-3">
          {actionCards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.to)}
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
