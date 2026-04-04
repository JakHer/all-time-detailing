import type { BookingStatus } from '../../data/bookings';

type BookingToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: BookingStatus | 'Wszystkie';
  onStatusFilterChange: (value: BookingStatus | 'Wszystkie') => void;
  statuses: Array<BookingStatus | 'Wszystkie'>;
  onCreateClick: () => void;
};

export function BookingToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  statuses,
  onCreateClick,
}: BookingToolbarProps) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Narzędzia recepcji
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Filtruj i organizuj wizyty
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
            Szukaj po kliencie, aucie lub usłudze i przełączaj statusy, żeby
            szybko ogarnąć bieżący dzień pracy.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 xl:max-w-130 xl:flex-row xl:items-end">
          <label className="block xl:flex-1">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
              Szukaj
            </span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Np. BMW, Mazur, ceramika"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-200/30 focus:bg-black/30"
            />
          </label>

          <button
            type="button"
            onClick={onCreateClick}
            className="rounded-full bg-linear-to-br from-amber-200 to-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(214,158,46,0.25)]"
          >
            Dodaj rezerwację
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
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
    </section>
  );
}
