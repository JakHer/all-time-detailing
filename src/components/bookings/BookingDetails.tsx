import type { Booking, BookingStatus } from '../../data/bookings';

const statusStyles: Record<BookingStatus, string> = {
  Nowa: 'border-sky-300/20 bg-sky-300/12 text-sky-100',
  Potwierdzona: 'border-amber-300/20 bg-amber-300/12 text-amber-100',
  'W realizacji': 'border-violet-300/20 bg-violet-300/12 text-violet-100',
  'Gotowa do odbioru':
    'border-emerald-300/20 bg-emerald-300/12 text-emerald-100',
  Anulowana: 'border-rose-300/20 bg-rose-300/12 text-rose-100',
};

type BookingDetailsProps = {
  booking: Booking | undefined;
  onEditClick: () => void;
  onCancelClick: () => void;
  onDeleteClick: () => void;
};

export function BookingDetails({
  booking,
  onEditClick,
  onCancelClick,
  onDeleteClick,
}: BookingDetailsProps) {
  if (!booking) {
    return (
      <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-sm leading-7 text-stone-400">
          Wybierz rezerwację z listy, aby zobaczyć szczegóły wizyty.
        </div>
      </article>
    );
  }

  const isCancelled = booking.status === 'Anulowana';

  return (
    <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegóły wizyty
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {booking.vehicle}
          </h3>
          <p className="mt-2 text-sm text-stone-400">
            {booking.client} • {booking.phone}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}
          >
            {booking.status}
          </span>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              type="button"
              onClick={onEditClick}
              className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
            >
              Edytuj
            </button>
            <button
              type="button"
              onClick={onCancelClick}
              disabled={isCancelled}
              className="rounded-full border border-amber-200/20 bg-amber-300/12 px-4 py-2 text-sm text-amber-50 transition hover:border-amber-200/30 hover:bg-amber-300/18 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onDeleteClick}
              className="rounded-full border border-rose-300/20 bg-rose-300/12 px-4 py-2 text-sm text-rose-50 transition hover:border-rose-300/30 hover:bg-rose-300/18"
            >
              Usuń
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Data', value: booking.date },
          { label: 'Godzina', value: booking.time },
          { label: 'Stanowisko', value: booking.bay },
          { label: 'Wartość', value: booking.amount },
          { label: 'Usługa', value: booking.service },
          { label: 'Rejestracja', value: booking.licensePlate },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
          Notatki zespołu
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-300">{booking.notes}</p>
      </div>
    </article>
  );
}
