import type { Booking } from '../../data/bookings';
import { StatusBadge } from '../ui/StatusBadge';
import { SelectableListItem } from '../ui/SelectableListItem';

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
    <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Lista wizyt
          </p>
          <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Plan dnia
          </h3>
        </div>
        <div className="text-xs text-stone-400">{bookings.length} pozycji</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista wizyt
        </p>
        <div className="text-xs text-stone-400">{bookings.length} pozycji</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {bookings.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
            Brak wizyt spelniajacych aktualne filtry. Sprobuj zmienic dzien,
            status albo wyszukiwanie.
          </div>
        ) : (
          bookings.map((booking) => {
            const isActive = booking.id === selectedBookingId;

            return (
              <div key={booking.id}>
                <SelectableListItem
                  onClick={() => onSelect(booking.id)}
                  isActive={isActive}
                  mobileLeading={
                    <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                      {booking.time}
                    </div>
                  }
                  mobileBody={
                    <p className="truncate text-sm font-medium text-white">
                      {booking.vehicle}{' '}
                      <span className="text-stone-500">|</span>{' '}
                      <span className="text-stone-400">{booking.client}</span>
                    </p>
                  }
                  mobileTrailing={
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusDotClassName(booking.status)}`}
                      aria-hidden="true"
                    />
                  }
                  desktopLeading={
                    <div className="text-base font-semibold tracking-[-0.03em] text-white">
                      {booking.time}
                    </div>
                  }
                  desktopBody={
                    <>
                      <p className="truncate text-sm font-semibold text-white">
                        {booking.vehicle}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-400">
                        {booking.client}
                        <span className="px-1 text-stone-500">|</span>
                        {booking.service}
                      </p>
                    </>
                  }
                  desktopTrailing={
                    <>
                      <p className="truncate text-xs text-stone-300">
                        {booking.amount}
                      </p>
                      <div className="mt-1 flex justify-end">
                        <StatusBadge status={booking.status} />
                      </div>
                    </>
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

function getStatusDotClassName(status: Booking['status']) {
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
