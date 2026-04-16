import { CalendarPlus2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookingStatus } from '../../data/bookings';
import { ActionButton } from '../ui/ActionButton';
import { SearchField } from '../ui/SearchField';

type BookingToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: BookingStatus | 'Wszystkie';
  onStatusFilterChange: (value: BookingStatus | 'Wszystkie') => void;
  statuses: Array<BookingStatus | 'Wszystkie'>;
  selectedDate: string;
  selectedDateLabel: string;
  onSelectedDateChange: (value: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onCreateClick: () => void;
};

export function BookingToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  statuses,
  selectedDate,
  selectedDateLabel,
  onSelectedDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  onCreateClick,
}: BookingToolbarProps) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-3 shadow-lg sm:rounded-4xl sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-6">
        <div className="hidden sm:flex sm:flex-col sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Narzedzia recepcji
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              Harmonogram dnia
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
              Zmien dzien, przeszukaj wizyty i zawez liste statusow bez
              przeladowywania calego widoku.
            </p>
          </div>

          <ActionButton
            icon={CalendarPlus2}
            onClick={onCreateClick}
            className="w-full sm:w-auto"
          >
            Dodaj rezerwacje
          </ActionButton>
        </div>

        <div className="sm:hidden">
          <div className="grid gap-2.5">
            <div className="rounded-2xl border border-white/8 bg-black/18 p-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPreviousDay}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Poprzedni dzien"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Dzien
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-white">
                    {selectedDateLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onNextDay}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Nastepny dzien"
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

            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => {
                const isActive = statusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusFilterChange(status)}
                    className={`min-w-0 rounded-2xl border px-3 py-2 text-center text-[11px] font-medium transition ${
                      isActive
                        ? 'border-amber-200/30 bg-amber-300/12 text-amber-100'
                        : 'border-white/10 bg-white/6 text-stone-300 hover:border-white/16 hover:bg-white/8 hover:text-white'
                    } ${status === 'Wszystkie' ? 'col-span-2' : ''}`}
                  >
                    <span className="block truncate">
                      {getMobileStatusLabel(status)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 gap-3 sm:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="hidden rounded-2xl border border-white/8 bg-black/18 p-3 sm:block sm:rounded-3xl md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Wybrany dzien
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {selectedDateLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onPreviousDay}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Poprzedni dzien"
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
                  onClick={onNextDay}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Nastepny dzien"
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

        <div className="hidden sm:flex sm:flex-wrap sm:gap-2.5">
          {statuses.map((status) => {
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-[11px] transition sm:px-4 sm:py-2 sm:text-sm ${
                  isActive
                    ? 'border-amber-200/30 bg-amber-300/12 text-amber-100'
                    : 'border-white/10 bg-white/6 text-stone-300 hover:border-white/16 hover:bg-white/8 hover:text-white'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getMobileStatusLabel(status: BookingStatus | 'Wszystkie') {
  switch (status) {
    case 'Wszystkie':
      return 'Wszystkie';
    case 'Potwierdzona':
      return 'Potwierdzone';
    case 'W realizacji':
      return 'W realizacji';
    case 'Gotowa do odbioru':
      return 'Do odbioru';
    default:
      return status;
  }
}
