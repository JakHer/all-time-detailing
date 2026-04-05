import { useQuery } from '@tanstack/react-query';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { HighlightsColumn } from '../components/dashboard/HighlightsColumn';
import { LiveQueueSection } from '../components/dashboard/LiveQueueSection';
import { SupabaseStatusCard } from '../components/supabase/SupabaseStatusCard';
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
      <DashboardHero metrics={data?.metrics} isLoading={isLoading} />

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <LiveQueueSection queue={data?.queue} isLoading={isLoading} />

        <div className="grid gap-4">
          <SupabaseStatusCard />
          <HighlightsColumn
            featuredServices={data?.featuredServices}
            isLoading={isLoading}
          />
        </div>
      </section>
    </>
  );
}
