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
    <section className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.28)] md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Narzędzia recepcji
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              Harmonogram dnia
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
              Zmień dzień, przeszukaj wizyty i zawęź listę statusów bez
              przeładowywania całego widoku.
            </p>
          </div>

          <ActionButton icon={CalendarPlus2} onClick={onCreateClick}>
            Dodaj rezerwację
          </ActionButton>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded-3xl border border-white/8 bg-black/18 p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Wybrany dzień
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
                  aria-label="Poprzedni dzień"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onToday}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                >
                  Dziś
                </button>

                <button
                  type="button"
                  onClick={onNextDay}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Następny dzień"
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

          <div className="rounded-3xl border border-white/8 bg-black/18 p-3 md:p-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Szukaj w wizytach
              </span>
              <SearchField
                value={query}
                onChange={onQueryChange}
                placeholder="Np. BMW, Mazur, ceramika"
                className="mt-2"
                compact
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {statuses.map((status) => {
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
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
