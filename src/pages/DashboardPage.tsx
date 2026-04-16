import { useQuery } from '@tanstack/react-query';
import { PageIntro } from '../components/PageIntro';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { HighlightsColumn } from '../components/dashboard/HighlightsColumn';
import { LiveQueueSection } from '../components/dashboard/LiveQueueSection';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
import { fetchDashboardData } from '../lib/dashboard';

const dashboardQueryKey = ['dashboard'] as const;

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardData,
  });

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-white">
        Wystapil blad podczas ladowania pulpitu.
      </div>
    );
  }

  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="Pulpit glowny"
          title="Mniej chaosu. Wiecej kontroli nad kazdym autem."
          description="Pulpit studia detailingu z szybkim wejsciem do rezerwacji, klientow i uslug. Tutaj zaczyna sie dzien pracy recepcji i zespolu wykonawczego."
          metrics={data?.metrics}
        />
      </div>

      <MobilePageHeader
        eyebrow="Pulpit"
        title="Dzien dobry"
        chips={
          data?.metrics
            ?.slice(0, 2)
            .map((metric) => `${metric.value} ${metric.label}`) ?? []
        }
      />

      <DashboardHero />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <LiveQueueSection queue={data?.queue} isLoading={isLoading} />

        <HighlightsColumn
          featuredServices={data?.featuredServices}
          isLoading={isLoading}
        />
      </section>
    </>
  );
}
