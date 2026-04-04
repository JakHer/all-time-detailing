import { DashboardHero } from '../components/dashboard/DashboardHero';
import { HighlightsColumn } from '../components/dashboard/HighlightsColumn';
import { LiveQueueSection } from '../components/dashboard/LiveQueueSection';

export function DashboardPage() {
  return (
    <>
      <DashboardHero />

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <LiveQueueSection />
        <HighlightsColumn />
      </section>
    </>
  );
}
