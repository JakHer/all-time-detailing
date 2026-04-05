import type { LiveJob } from '../../lib/dashboard';
import { StatusBadge } from '../ui/StatusBadge';
import { getTodayDateString, formatShortDate } from '../../lib/dateUtils';
import { Skeleton } from '../ui/Skeleton';

type LiveQueueSectionProps = {
  queue?: LiveJob[];
  isLoading: boolean;
};

export function LiveQueueSection({ queue, isLoading }: LiveQueueSectionProps) {
  const jobs = queue ?? [];
  const todayDate = formatShortDate(getTodayDateString());

  return (
    <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Rytm dnia
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Dzisiejsza kolejka zleceń
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
            Widok pod recepcję i zespół wykonawczy: kto przyjeżdża, co robimy i
            na jakim etapie jest każde auto.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full border border-amber-200/20 bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-100">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            `${todayDate} | ${jobs.length} ${jobs.length === 1 ? 'pozycja' : 'pozycje'} w planie`
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-[26px]" />
          ))
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-sm leading-7 text-stone-400 text-center">
            Brak zaplanowanych wizyt na dziś.
          </div>
        ) : (
          jobs.map((job, index) => (
            <div
              key={`${job.vehicle}-${job.time}-${index}`}
              className="grid gap-4 rounded-[26px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 md:grid-cols-[90px_minmax(0,1fr)_220px] md:items-center"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Start
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {job.time}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8 text-xs font-semibold text-stone-200">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {job.vehicle}
                    </p>
                    <p className="text-sm text-stone-400">{job.client}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {job.service}
                </p>
              </div>

              <div className="flex justify-start md:justify-end">
                <StatusBadge status={job.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
