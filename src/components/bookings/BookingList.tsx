import type { Booking } from '../../data/bookings';
import { StatusBadge } from '../primitives/StatusBadge';
import { SelectableListItem } from '../entity/SelectableListItem';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';

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
    <article className={surfaceStyles.entityList}>
      <div className={layoutStyles.listHeaderDesktop}>
        <div>
          <p className={textStyles.eyebrowAmber}>Lista wizyt</p>
          <h3 className={textStyles.listTitle}>Plan dnia</h3>
        </div>
        <div className={textStyles.listCount}>{bookings.length} pozycji</div>
      </div>

      <div className={layoutStyles.listHeaderMobile}>
        <p className={textStyles.eyebrowMuted}>Lista wizyt</p>
        <div className={textStyles.listCount}>{bookings.length} pozycji</div>
      </div>

      <div className={layoutStyles.listItems}>
        {bookings.length === 0 ? (
          <div className={surfaceStyles.emptyState}>
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
