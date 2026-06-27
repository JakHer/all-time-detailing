import {
  BarChart3,
  CarFront,
  ClipboardCheck,
  Handshake,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type KpiCategoryId =
  | 'timeliness'
  | 'quality'
  | 'organization'
  | 'communication'
  | 'discipline'
  | 'growth';

export type KpiCategory = {
  id: KpiCategoryId;
  label: string;
  max: number;
};

export type KpiScores = Record<KpiCategoryId, number>;

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  scores: KpiScores;
};

export type KpiProcessStep = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export const processSteps: KpiProcessStep[] = [
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

export const kpiCategories: KpiCategory[] = [
  { id: 'timeliness', label: 'Terminowosc', max: 30 },
  { id: 'quality', label: 'Jakosc', max: 25 },
  { id: 'organization', label: 'Organizacja', max: 15 },
  { id: 'communication', label: 'Komunikacja', max: 10 },
  { id: 'discipline', label: 'Dyscyplina', max: 10 },
  { id: 'growth', label: 'Rozwoj', max: 10 },
];

export const teamMembers: TeamMember[] = [
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

export const getMemberScore = (member: TeamMember) =>
  kpiCategories.reduce(
    (total, category) => total + member.scores[category.id],
    0,
  );

export const getAverageScore = () => {
  const totalScore = teamMembers.reduce(
    (total, member) => total + getMemberScore(member),
    0,
  );

  return Math.round(totalScore / teamMembers.length);
};

export const getScoreStatus = (score: number) => {
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

export const kpiOverviewStats = [
  { label: 'Zespol', value: `${teamMembers.length} osoby` },
  { label: 'Oceny', value: `${teamMembers.length} / ${teamMembers.length}` },
  { label: 'Srednia', value: `${getAverageScore()} pkt` },
  { label: 'Skala', value: '100 pkt' },
];
