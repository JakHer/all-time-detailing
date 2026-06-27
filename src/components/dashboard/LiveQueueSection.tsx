import { useNavigate } from 'react-router-dom';
import type { LiveJob } from '../../lib/dashboard';
import { formatShortDate, getTodayDateString } from '../../lib/dateUtils';
import { SelectableListItem } from '../entity/SelectableListItem';
import { StatusBadge } from '../primitives/StatusBadge';
import { Skeleton } from '../primitives/Skeleton';

type LiveQueueSectionProps = {
  queue?: LiveJob[];
  isLoading: boolean;
};

function getJobsLabel(count: number) {
  if (count === 1) return 'zlecenie dziś';
  if (count >= 2 && count <= 4) return 'zlecenia dziś';
  return 'zleceń dziś';
}

export function LiveQueueSection({ queue, isLoading }: LiveQueueSectionProps) {
  const navigate = useNavigate();
  const jobs = queue ?? [];
  const todayDate = formatShortDate(getTodayDateString());
  const readyCount = jobs.filter(
    (job) => job.status === 'Gotowa do odbioru',
  ).length;
  const activeCount = jobs.filter(
    (job) =>
      job.status === 'Nowa' ||
      job.status === 'Potwierdzona' ||
      job.status === 'W realizacji',
  ).length;
  const cancelledCount = jobs.filter(
    (job) => job.status === 'Anulowana',
  ).length;
  const statusLabelParts = [
    activeCount > 0 ? `${activeCount} aktywne` : null,
    readyCount > 0 ? `${readyCount} gotowe do odbioru` : null,
    cancelledCount > 0 ? `${cancelledCount} anulowane` : null,
  ].filter(Boolean) as string[];

  return (
    <article className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-lg sm:rounded-4xl sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/60 sm:text-xs sm:text-amber-200">
            Rytm dnia
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:mt-2 sm:text-3xl sm:tracking-[-0.04em]">
            Kolejka zleceń
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-40 rounded-full" />
            </>
          ) : (
            <>
              <div className="inline-flex w-fit whitespace-nowrap rounded-full border border-amber-200/20 bg-amber-300/12 px-3 py-1 text-[10px] font-semibold text-amber-100 sm:text-xs">
                {todayDate}
              </div>
              <div className="inline-flex w-fit whitespace-nowrap rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[10px] font-semibold text-white sm:text-xs">
                {jobs.length} {getJobsLabel(jobs.length)}
              </div>
              {statusLabelParts.length > 0 ? (
                <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-medium text-stone-300 sm:inline-flex sm:text-xs">
                  {statusLabelParts.join(' • ')}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:mt-6 sm:gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 rounded-2xl sm:h-27.5 sm:rounded-[26px]"
            />
          ))
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:rounded-3xl">
            Brak zaplanowanych wizyt na dziś.
          </div>
        ) : (
          jobs.map((job, index) => (
            <div key={`${job.id}-${job.time}-${index}`}>
              <SelectableListItem
                onClick={() =>
                  navigate(`/rezerwacje?date=${job.date}&booking=${job.id}`)
                }
                isActive={false}
                mobileLeading={
                  <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                    {job.time}
                  </div>
                }
                mobileBody={
                  <p className="truncate text-sm font-medium text-white">
                    {job.vehicle} <span className="text-stone-500">|</span>{' '}
                    <span className="text-stone-400">{job.client}</span>
                  </p>
                }
                mobileTrailing={
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusDotClassName(job.status)}`}
                    aria-hidden="true"
                  />
                }
                desktopLeading={
                  <div className="text-base font-semibold tracking-[-0.03em] text-white">
                    {job.time}
                  </div>
                }
                desktopBody={
                  <>
                    <p className="truncate text-sm font-semibold text-white">
                      {job.vehicle}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-stone-400">
                      {job.client}
                      <span className="px-1 text-stone-500">|</span>
                      {job.service}
                    </p>
                  </>
                }
                desktopTrailing={
                  <>
                    <p className="truncate text-xs text-stone-300">
                      {job.amount}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={job.status} />
                    </div>
                  </>
                }
              />
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function getStatusDotClassName(status: LiveJob['status']) {
  switch (status) {
    case 'Nowa':
      return 'bg-sky-300';
    case 'Potwierdzona':
      return 'bg-amber-300';
    case 'W realizacji':
      return 'bg-violet-300';
    case 'Gotowa do odbioru':
      return 'bg-emerald-300';
    case 'Anulowana':
      return 'bg-rose-300';
    default:
      return 'bg-stone-400';
  }
}
