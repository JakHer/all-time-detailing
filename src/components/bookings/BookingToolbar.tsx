import { CalendarPlus2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionButton } from '../primitives/ActionButton';
import { SearchField } from '../primitives/SearchField';

export type BookingCalendarView = 'day' | 'week' | 'month';

type BookingToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  calendarView: BookingCalendarView;
  onCalendarViewChange: (value: BookingCalendarView) => void;
  selectedDate: string;
  selectedRangeLabel: string;
  rangeLabelEyebrow: string;
  onSelectedDateChange: (value: string) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  onCreateClick: () => void;
};

export function BookingToolbar({
  query,
  onQueryChange,
  calendarView,
  onCalendarViewChange,
  selectedDate,
  selectedRangeLabel,
  rangeLabelEyebrow,
  onSelectedDateChange,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
  onCreateClick,
}: BookingToolbarProps) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-3 shadow-lg sm:rounded-4xl sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-6">
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/8 bg-black/18 p-1.5 sm:inline-grid">
            {viewOptions.map((option) => {
              const isActive = option.value === calendarView;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onCalendarViewChange(option.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-[11px] ${
                    isActive
                      ? 'bg-amber-300 text-black shadow-[0_6px_24px_rgba(214,158,46,0.24)]'
                      : 'text-stone-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block">
            <ActionButton
              icon={CalendarPlus2}
              onClick={onCreateClick}
              className="sm:w-auto"
            >
              Dodaj rezerwacje
            </ActionButton>
          </div>
        </div>

        <div className="hidden sm:flex sm:flex-col sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Narzedzia recepcji
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              {getHeadingForView(calendarView)}
            </h3>
          </div>
        </div>

        <div className="sm:hidden">
          <div className="grid gap-2.5">
            <div className="rounded-2xl border border-white/8 bg-black/18 p-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPreviousPeriod}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Poprzedni okres"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {rangeLabelEyebrow}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-white">
                    {selectedRangeLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onNextPeriod}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Nastepny okres"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onToday}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                >
                  Dzis
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onSelectedDateChange(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-amber-200/30 focus:bg-black/30"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/18 p-2.5">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Szukaj w wizytach
                </span>
                <SearchField
                  value={query}
                  onChange={onQueryChange}
                  placeholder="Szukaj wizyty..."
                  className="mt-2 w-full"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 gap-3 sm:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="hidden rounded-2xl border border-white/8 bg-black/18 p-3 sm:block sm:rounded-3xl md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {rangeLabelEyebrow}
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {selectedRangeLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onPreviousPeriod}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Poprzedni okres"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onToday}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                >
                  Dzis
                </button>

                <button
                  type="button"
                  onClick={onNextPeriod}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Nastepny okres"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onSelectedDateChange(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-amber-200/30 focus:bg-black/30"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/8 bg-black/18 p-2.5 sm:rounded-3xl sm:p-3 md:p-4">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-[11px]">
                Szukaj w wizytach
              </span>
              <SearchField
                value={query}
                onChange={onQueryChange}
                placeholder="Szukaj wizyty..."
                className="mt-2 w-full"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

const viewOptions: Array<{ value: BookingCalendarView; label: string }> = [
  { value: 'day', label: 'Dzien' },
  { value: 'week', label: 'Tydzien' },
  { value: 'month', label: 'Miesiac' },
];

function getHeadingForView(calendarView: BookingCalendarView) {
  switch (calendarView) {
    case 'week':
      return 'Plan tygodnia';
    case 'month':
      return 'Przeglad miesiaca';
    default:
      return 'Harmonogram dnia';
  }
}
