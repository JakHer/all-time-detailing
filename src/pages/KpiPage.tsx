import {
  BarChart3,
  CarFront,
  ClipboardCheck,
  Handshake,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, type ReactNode } from 'react';
import { PageIntro } from '../components/PageIntro';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
import { SelectableListItem } from '../components/ui/SelectableListItem';

type KpiCategoryId =
  | 'timeliness'
  | 'quality'
  | 'organization'
  | 'communication'
  | 'discipline'
  | 'growth';

type KpiCategory = {
  id: KpiCategoryId;
  label: string;
  max: number;
};

type KpiScores = Record<KpiCategoryId, number>;

type TeamMember = {
  id: string;
  name: string;
  role: string;
  scores: KpiScores;
};

const processSteps = [
  {
    title: 'Planowanie',
    body: 'Ustalamy zakres, termin i odpowiedzialnego za projekt.',
    icon: ClipboardCheck,
  },
  {
    title: 'Przygotowanie',
    body: 'Przygotowanie auta, stanowiska, materialow i narzedzi.',
    icon: CarFront,
  },
  {
    title: 'Realizacja',
    body: 'Wykonanie uslugi zgodnie ze standardem i czasem zaplanowanym.',
    icon: Sparkles,
  },
  {
    title: 'Kontrola jakosci',
    body: 'Sprawdzenie efektu, poprawek i zgodnosci z wymaganiami.',
    icon: Search,
  },
  {
    title: 'Oddanie auta',
    body: 'Odbior klienta, dokumentacja i zebranie feedbacku.',
    icon: Handshake,
  },
  {
    title: 'Podsumowanie',
    body: 'Analiza KPI, wnioski, dzialania korygujace i cele na kolejny miesiac.',
    icon: BarChart3,
  },
];

const kpiCategories: KpiCategory[] = [
  { id: 'timeliness', label: 'Terminowosc', max: 30 },
  { id: 'quality', label: 'Jakosc', max: 25 },
  { id: 'organization', label: 'Organizacja', max: 15 },
  { id: 'communication', label: 'Komunikacja', max: 10 },
  { id: 'discipline', label: 'Dyscyplina', max: 10 },
  { id: 'growth', label: 'Rozwoj', max: 10 },
];

const teamMembers: TeamMember[] = [
  {
    id: 'mateusz',
    name: 'Mateusz',
    role: 'Aplikator PPF',
    scores: {
      timeliness: 30,
      quality: 25,
      organization: 15,
      communication: 10,
      discipline: 10,
      growth: 8,
    },
  },
  {
    id: 'przemek',
    name: 'Przemek',
    role: 'Aplikator PPF',
    scores: {
      timeliness: 28,
      quality: 23,
      organization: 14,
      communication: 8,
      discipline: 10,
      growth: 9,
    },
  },
  {
    id: 'radek',
    name: 'Radek',
    role: 'Detailing / wdrozenie',
    scores: {
      timeliness: 24,
      quality: 20,
      organization: 11,
      communication: 7,
      discipline: 8,
      growth: 8,
    },
  },
  {
    id: 'wiktor',
    name: 'Wiktor',
    role: 'Detailing / wdrozenie',
    scores: {
      timeliness: 20,
      quality: 18,
      organization: 10,
      communication: 6,
      discipline: 8,
      growth: 7,
    },
  },
];

const getMemberScore = (member: TeamMember) =>
  kpiCategories.reduce(
    (total, category) => total + member.scores[category.id],
    0,
  );

const getAverageScore = () => {
  const totalScore = teamMembers.reduce(
    (total, member) => total + getMemberScore(member),
    0,
  );

  return Math.round(totalScore / teamMembers.length);
};

const getScoreStatus = (score: number) => {
  if (score >= 98) {
    return {
      label: 'Wybitny',
      dotClassName: 'bg-emerald-300',
      textClassName: 'text-emerald-200',
    };
  }

  if (score >= 95) {
    return {
      label: 'Bardzo dobry',
      dotClassName: 'bg-lime-300',
      textClassName: 'text-lime-200',
    };
  }

  if (score >= 90) {
    return {
      label: 'Dobry',
      dotClassName: 'bg-amber-300',
      textClassName: 'text-amber-200',
    };
  }

  if (score >= 80) {
    return {
      label: 'Wymaga poprawy',
      dotClassName: 'bg-orange-300',
      textClassName: 'text-orange-200',
    };
  }

  return {
    label: 'Plan naprawczy',
    dotClassName: 'bg-rose-300',
    textClassName: 'text-rose-200',
  };
};

const kpiOverviewStats = [
  { label: 'Zespol', value: `${teamMembers.length} osoby` },
  { label: 'Oceny', value: `${teamMembers.length} / ${teamMembers.length}` },
  { label: 'Srednia', value: `${getAverageScore()} pkt` },
  { label: 'Skala', value: '100 pkt' },
];

export const KpiPage = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const selectedMember =
    teamMembers.find((member) => member.id === selectedMemberId) ?? null;

  function handleSelectMember(memberId: string) {
    setSelectedMemberId(memberId);

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(min-width: 1536px)').matches
    ) {
      setIsMobileDetailsOpen(true);
    }
  }

  function closeMemberDetails() {
    setSelectedMemberId(null);
    setIsMobileDetailsOpen(false);
  }

  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="System KPI"
          title="Mierzymy to, co ma wplyw na jakosc, termin i zysk."
          description="Pierwszy krok modulu KPI: wspolny proces pracy, ktory pozniej polaczymy z punktacja zespolu i celami miesiecznymi."
          metrics={[
            { label: 'Etapy procesu', value: '6' },
            { label: 'Maksymalny wynik', value: '100 pkt' },
            { label: 'Przeglad', value: 'Miesieczny' },
            { label: 'Cel', value: '+1% dziennie' },
          ]}
        />
      </div>

      <MobilePageHeader
        eyebrow="KPI"
        title="Proces zespolu"
        chips={['6 etapow', '100 pkt', 'przeglad miesieczny']}
      />

      <KpiSection
        eyebrow="1. Procesy"
        title="Jak to dziala?"
        description="Ten sam rytm pracy dla kazdego projektu: od planowania po miesieczne wnioski. Dzieki temu KPI nie jest ocena z kosmosu, tylko wynikiem codziennego procesu."
      >
        <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {processSteps.map((step, index) => (
            <ProcessStepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </KpiSection>

      <KpiSection
        eyebrow="2. Tablica zespolowa"
        title="Podglad miesieczny"
        action={
          <div className="inline-flex w-fit items-center rounded-full border border-amber-200/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
            Miesiac: czerwiec 2026
          </div>
        }
      >
        <KpiOverviewStrip />
        <section
          className={`mt-6 grid min-w-0 gap-6 ${
            selectedMember
              ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
              : ''
          }`}
        >
          <TeamMemberList
            selectedMemberId={selectedMemberId}
            onSelect={handleSelectMember}
          />

          {selectedMember ? (
            <div className="hidden min-w-0 max-w-full 2xl:block">
              <KpiMemberDetails
                member={selectedMember}
                onCloseClick={closeMemberDetails}
              />
            </div>
          ) : null}
        </section>
      </KpiSection>

      <Dialog.Root
        open={isMobileDetailsOpen && !!selectedMember}
        onOpenChange={(open) => {
          if (open) {
            setIsMobileDetailsOpen(true);
            return;
          }

          closeMemberDetails();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm 2xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-70 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none 2xl:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Szczegoly KPI
                </p>
                <p className="mt-1 truncate text-sm text-stone-400">
                  {selectedMember?.name ?? 'Wybrany pracownik'}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                  aria-label="Zamknij szczegoly KPI"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {selectedMember ? (
                <KpiMemberDetails member={selectedMember} variant="sheet" />
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

const KpiSection = ({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-stone-300">
            {description}
          </p>
        ) : null}
        {action}
      </div>
      {children}
    </section>
  );
};

const ProcessStepCard = ({
  step,
  index,
}: {
  step: (typeof processSteps)[number];
  index: number;
}) => {
  const Icon = step.icon;

  return (
    <article className="relative min-h-52 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
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
      <p className="mt-3 text-sm leading-6 text-stone-300">{step.body}</p>
    </article>
  );
};

const TeamMemberList = ({
  selectedMemberId,
  onSelect,
}: {
  selectedMemberId: string | null;
  onSelect: (memberId: string) => void;
}) => {
  return (
    <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Lista pracownikow
          </p>
          <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Oceny miesieczne
          </h3>
        </div>
        <div className="text-xs text-stone-400">{teamMembers.length} osoby</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista pracownikow
        </p>
        <div className="text-xs text-stone-400">{teamMembers.length} osoby</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {teamMembers.map((member) => (
          <TeamMemberListItem
            key={member.id}
            member={member}
            isActive={member.id === selectedMemberId}
            onSelect={() => onSelect(member.id)}
          />
        ))}
      </div>
    </article>
  );
};

const TeamMemberListItem = ({
  member,
  isActive,
  onSelect,
}: {
  member: TeamMember;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const score = getMemberScore(member);
  const status = getScoreStatus(score);

  return (
    <SelectableListItem
      onClick={onSelect}
      isActive={isActive}
      mobileLeading={<KpiStatusDot status={status} />}
      mobileBody={
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {member.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-400">
            {member.role}
          </p>
        </div>
      }
      mobileTrailing={<KpiListScore score={score} />}
      desktopLeading={<KpiStatusDot status={status} />}
      desktopBody={
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {member.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-400">
            {member.role}
          </p>
        </div>
      }
      desktopTrailing={
        <div className="grid justify-items-end gap-1">
          <p className="truncate text-xs text-stone-300">{score} / 100</p>
          <p className={`truncate text-[11px] ${status.textClassName}`}>
            {status.label}
          </p>
        </div>
      }
    />
  );
};

const KpiMemberDetails = ({
  member,
  onCloseClick,
  variant = 'card',
}: {
  member: TeamMember;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
}) => {
  const isSheet = variant === 'sheet';
  const score = getMemberScore(member);
  const status = getScoreStatus(score);
  const containerClassName = isSheet
    ? 'w-full max-w-full overflow-hidden'
    : 'min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]';

  return (
    <article className={containerClassName}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onCloseClick}
            onPointerDown={(event) => {
              event.preventDefault();
              onCloseClick();
            }}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
            aria-label="Zamknij szczegoly KPI"
            title="Zamknij szczegoly KPI"
          >
            <X className="h-4.5 w-4.5" />
          </button>
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
        <SummaryChip label="Miesiac" value="czerwiec 2026" />
        <SummaryChip label="Ocena" value={status.label} />
        <SummaryChip label="Skala" value="100 pkt" />
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
    </article>
  );
};

const KpiOverviewStrip = () => {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {kpiOverviewStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/8 bg-black/14 px-4 py-3"
        >
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

const KpiStatusDot = ({
  status,
}: {
  status: ReturnType<typeof getScoreStatus>;
}) => {
  return (
    <div
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dotClassName}`}
      aria-hidden="true"
    />
  );
};

const KpiListScore = ({ score }: { score: number }) => {
  return <p className="truncate text-xs text-stone-300">{score} pkt</p>;
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

const SummaryChip = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      <span className="text-stone-500">{label}:</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
};
