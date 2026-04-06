import type { Booking } from '../../data/bookings';
import { StatusBadge } from '../ui/StatusBadge';

type BookingListProps = {
  bookings: Booking[];
  selectedBookingId: string | null;
  onSelect: (bookingId: string) => void;
};

export function BookingList({
  bookings,
  selectedBookingId,
  onSelect,
}: BookingListProps) {
  return (
    <article className="min-h-130 rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Lista wizyt
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Plan dnia
          </h3>
        </div>
        <div className="text-sm text-stone-400">{bookings.length} pozycji</div>
      </div>

      <div className="mt-6 grid gap-3">
        {bookings.length === 0 ? (
          <div className="flex min-h-97.5 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
            Brak wizyt spełniających aktualne filtry. Spróbuj zmienić dzień,
            status albo wyszukiwanie.
          </div>
        ) : (
          bookings.map((booking) => {
            const isActive = booking.id === selectedBookingId;

            return (
              <button
                key={booking.id}
                type="button"
                onClick={() => onSelect(booking.id)}
                className={`grid gap-4 rounded-[26px] border p-4 text-left transition md:grid-cols-[88px_minmax(0,1fr)_auto] md:items-center ${
                  isActive
                    ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
                    : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                }`}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    Start
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                    {booking.time}
                  </div>
                  <div className="mt-1 text-sm text-stone-400">
                    {booking.duration}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {booking.vehicle}
                      </p>
                      <p className="text-sm text-stone-400">{booking.client}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    {booking.service}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm text-stone-400">
                    {booking.amount}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </article>
  );
}
