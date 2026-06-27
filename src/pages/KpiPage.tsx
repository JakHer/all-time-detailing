import {
  BarChart3,
  CarFront,
  ClipboardCheck,
  Handshake,
  Search,
  Sparkles,
} from 'lucide-react';
import { PageIntro } from '../components/PageIntro';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';

const processSteps = [
  {
    title: 'Planowanie',
    body: 'Ustalamy zakres, termin i odpowiedzialnego za projekt.',
    icon: ClipboardCheck,
  },
  {
    title: 'Przygotowanie',
    body: 'Przygotowanie auta, stanowiska, materiałów i narzędzi.',
    icon: CarFront,
  },
  {
    title: 'Realizacja',
    body: 'Wykonanie usługi zgodnie ze standardem i czasem zaplanowanym.',
    icon: Sparkles,
  },
  {
    title: 'Kontrola jakości',
    body: 'Sprawdzenie efektu, poprawek i zgodności z wymaganiami.',
    icon: Search,
  },
  {
    title: 'Oddanie auta',
    body: 'Odbiór klienta, dokumentacja i zebranie feedbacku.',
    icon: Handshake,
  },
  {
    title: 'Podsumowanie',
    body: 'Analiza KPI, wnioski, działania korygujące i cele na kolejny miesiąc.',
    icon: BarChart3,
  },
];

export function KpiPage() {
  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="System KPI"
          title="Mierzymy to, co ma wpływ na jakość, termin i zysk."
          description="Pierwszy krok modułu KPI: wspólny proces pracy, który później połączymy z punktacją zespołu i celami miesięcznymi."
          metrics={[
            { label: 'Etapy procesu', value: '6' },
            { label: 'Maksymalny wynik', value: '100 pkt' },
            { label: 'Przegląd', value: 'Miesięczny' },
            { label: 'Cel', value: '+1% dziennie' },
          ]}
        />
      </div>

      <MobilePageHeader
        eyebrow="KPI"
        title="Proces zespołu"
        chips={['6 etapów', '100 pkt', 'przegląd miesięczny']}
      />

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
              1. Procesy
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Jak to działa?
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-300">
            Ten sam rytm pracy dla każdego projektu: od planowania po miesięczne
            wnioski. Dzięki temu KPI nie jest oceną z kosmosu, tylko wynikiem
            codziennego procesu.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="relative min-h-52 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-200/25 bg-amber-300/12 text-amber-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em] text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
