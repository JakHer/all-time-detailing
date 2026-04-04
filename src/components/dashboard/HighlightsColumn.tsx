import { actionCards, featuredServices } from "../../data/dashboard";

export function HighlightsColumn() {
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
          {featuredServices.map((service) => (
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
          ))}
        </div>
      </article>

      <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Szybkie sekcje
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Moduły, które możemy budować dalej
        </h3>

        <div className="mt-6 grid gap-3">
          {actionCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border border-white/8 bg-linear-to-br ${card.tone} p-4`}
            >
              <h4 className="text-lg font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm leading-7 text-stone-300">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
