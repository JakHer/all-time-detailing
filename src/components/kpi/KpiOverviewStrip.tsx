import { kpiOverviewStats } from '../../data/kpi';
import { surfaceStyles } from '../design/styles';

export const KpiOverviewStrip = () => {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {kpiOverviewStats.map((stat) => (
        <div key={stat.label} className={surfaceStyles.softMetric}>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
            {stat.label}
          </p>
          <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-white">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};
