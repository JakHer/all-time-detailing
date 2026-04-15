import { useQuery } from '@tanstack/react-query';
import { PageIntro } from '../components/PageIntro';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { HighlightsColumn } from '../components/dashboard/HighlightsColumn';
import { LiveQueueSection } from '../components/dashboard/LiveQueueSection';
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
        Wystąpił błąd podczas ładowania pulpitu.
      </div>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Pulpit główny"
        title="Mniej chaosu. Więcej kontroli nad każdym autem."
        description="Pulpit studia detailingu z szybkim wejściem do rezerwacji, klientów i usług. Tutaj zaczyna się dzień pracy recepcji i zespołu wykonawczego."
        metrics={data?.metrics}
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
