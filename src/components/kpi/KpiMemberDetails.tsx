import {
  getMemberScore,
  getScoreStatus,
  kpiCategories,
  type KpiCategory,
  type TeamMember,
} from '../../data/kpi';
import { DetailCloseButton, DetailPanel } from '../details/DetailPanel';
import { DetailSummaryChip } from '../details/DetailSummaryChip';

type KpiMemberDetailsProps = {
  member: TeamMember;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
};

export const KpiMemberDetails = ({
  member,
  onCloseClick,
  variant = 'card',
}: KpiMemberDetailsProps) => {
  const isSheet = variant === 'sheet';
  const score = getMemberScore(member);
  const status = getScoreStatus(score);

  return (
    <DetailPanel variant={variant}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <DetailCloseButton
            label="Zamknij szczegoly KPI"
            onClick={onCloseClick}
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegoly KPI
          </p>
          <h3
            className={
              isSheet
                ? 'mt-1.5 wrap-break-word text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl'
                : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white'
            }
          >
            {member.name}
          </h3>
          <p className="mt-1.5 wrap-break-word text-xs text-stone-400">
            {member.role}
          </p>
        </div>

        <div className="flex max-w-full flex-col items-start gap-3 md:items-end">
          <ReviewStatusBadge status={status} />
          <ScoreSummary score={score} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DetailSummaryChip label="Miesiac" value="czerwiec 2026" />
        <DetailSummaryChip label="Ocena" value={status.label} />
        <DetailSummaryChip label="Skala" value="100 pkt" />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {kpiCategories.map((category) => (
          <KpiMetricPill
            key={category.label}
            category={category}
            value={member.scores[category.id]}
          />
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-6 text-sm leading-6 text-stone-400">
        Tu pojawi sie podsumowanie 1 na 1: mocne strony, obszary do poprawy i
        cele na kolejny miesiac.
      </div>
    </DetailPanel>
  );
};

const KpiMetricPill = ({
  category,
  value,
}: {
  category: KpiCategory;
  value: number;
}) => {
  const progress = Math.round((value / category.max) * 100);

  return (
    <div className="min-h-20 rounded-2xl border border-white/8 bg-black/14 px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">
          {category.label}
        </p>
        <span className="shrink-0 text-[10px] text-stone-600">
          {category.max}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-stone-200">
        {value} / {category.max}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-amber-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ReviewStatusBadge = ({
  status,
}: {
  status: ReturnType<typeof getScoreStatus>;
}) => {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-stone-300">
      {status.label}
    </span>
  );
};

const ScoreSummary = ({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) => {
  return (
    <div
      className={`flex flex-col justify-center rounded-2xl border border-amber-200/20 bg-amber-300/12 text-center ${
        compact ? 'min-w-24 px-3 py-2' : 'h-full min-h-24 px-4'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100/70">
        Razem
      </p>
      <p
        className={`mt-1 font-semibold tracking-[-0.04em] text-amber-100 ${
          compact ? 'text-base' : 'text-2xl'
        }`}
      >
        {score}
      </p>
      <p className="text-[10px] font-medium text-amber-100/60">/ 100 pkt</p>
    </div>
  );
};
