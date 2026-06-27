import type { Booking } from '../../data/bookings';
import {
  formatWeekdayLabel,
  getTodayDateString,
  getWeekDateStrings,
} from '../../lib/dateUtils';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import { SelectableListItem } from '../entity/SelectableListItem';
import { StatusBadge } from '../primitives/StatusBadge';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';

type BookingWeekViewProps = {
  bookings: Booking[];
  selectedBookingId: string | null;
  selectedDate: string;
  onSelect: (bookingId: string) => void;
  onDaySelect: (dateString: string) => void;
};

export function BookingWeekView({
  bookings,
  selectedBookingId,
  selectedDate,
  onSelect,
  onDaySelect,
}: BookingWeekViewProps) {
  const today = getTodayDateString();
  const weekDates = getWeekDateStrings(selectedDate);
  const bookingsByDate = weekDates.map((dateString) => ({
    dateString,
    bookings: bookings.filter((booking) => booking.date === dateString),
  }));

  return (
    <article className={surfaceStyles.entityList}>
      <div className={layoutStyles.listHeaderDesktop}>
        <div>
          <p className={textStyles.eyebrowAmber}>Tydzien</p>
          <h3 className={textStyles.listTitle}>Plan tygodnia</h3>
        </div>
        <div className={textStyles.listCount}>
          {bookings.length} wizyt w tygodniu
        </div>
      </div>

      <div className={layoutStyles.listHeaderMobile}>
        <p className={textStyles.eyebrowMuted}>Tydzien</p>
        <div className={textStyles.listCount}>
          {bookings.length} wizyt w tygodniu
        </div>
      </div>

      <div className="sm:mt-5">
        <div className="grid gap-2 sm:hidden">
          {bookingsByDate.map(({ dateString, bookings: dayBookings }) => {
            const hasBookings = dayBookings.length > 0;
            const isToday = dateString === today;
            const isActiveDay = isToday;
            const dayLabel = formatWeekdayLabel(dateString, {
              weekday: 'short',
            });

            return (
              <button
                key={dateString}
                type="button"
                onClick={() => onDaySelect(dateString)}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition ${
                  isActiveDay
                    ? 'border-amber-200/20 bg-amber-300/8'
                    : hasBookings
                      ? 'border-emerald-200/12 bg-white/6 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.06)] hover:border-emerald-200/20 hover:bg-white/8'
                      : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {dayLabel}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-lg font-semibold tracking-[-0.04em] text-white">
                      {dateString.slice(-2)}
                    </p>
                    <p className="truncate text-sm text-stone-400">
                      {dayBookings.length === 0
                        ? 'Brak wizyt'
                        : dayBookings.length === 1
                          ? '1 wizyta'
                          : dayBookings.length < 5
                            ? `${dayBookings.length} wizyty`
                            : `${dayBookings.length} wizyt`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActiveDay ? (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                      Dzien
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-semibold ${getCountBadgeClassName(
                      dayBookings.length,
                    )}`}
                  >
                    {dayBookings.length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block">
          {bookingsByDate.map(({ dateString, bookings: dayBookings }) => {
            const hasBookings = dayBookings.length > 0;
            const isToday = dateString === today;
            const isActiveDay = isToday;
            const dayTitle = `${formatWeekdayLabel(dateString, {
              weekday: 'long',
            })} ${dateString.slice(-2)}`;
            const daySubtitle = formatWeekdayLabel(dateString, {
              month: 'long',
            });

            return (
              <div
                key={dateString}
                className={
                  isActiveDay
                    ? '[&>details]:border-amber-200/20 [&>details]:bg-amber-300/8'
                    : hasBookings
                      ? '[&>details]:border-emerald-200/10 [&>details]:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.05)]'
                      : ''
                }
              >
                <CollapsibleDetailSection
                  title={dayTitle}
                  countLabel={daySubtitle}
                  defaultOpen={isToday}
                  summaryBadge={
                    hasBookings && !isToday ? (
                      <span
                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1f2022] px-1.5 text-[10px] font-semibold ${getCountBadgeClassName(
                          dayBookings.length,
                        )}`}
                        aria-label={`${dayBookings.length} ${dayBookings.length === 1 ? 'wizyta' : dayBookings.length < 5 ? 'wizyty' : 'wizyt'}`}
                      >
                        {dayBookings.length}
                      </span>
                    ) : null
                  }
                >
                  <div className="grid gap-2.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDaySelect(dateString)}
                        className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-medium text-stone-200 transition hover:border-white/16 hover:bg-white/10 hover:text-white"
                      >
                        Otworz dzien
                      </button>
                    </div>

                    {dayBookings.length > 0 ? (
                      <div className="grid gap-2">
                        {dayBookings.map((booking) => {
                          const isActiveBooking =
                            booking.id === selectedBookingId;

                          return (
                            <div key={booking.id}>
                              <SelectableListItem
                                onClick={() => onSelect(booking.id)}
                                isActive={isActiveBooking}
                                mobileLeading={
                                  <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                                    {booking.time}
                                  </div>
                                }
                                mobileBody={
                                  <p className="truncate text-sm font-medium text-white">
                                    {booking.vehicle}{' '}
                                    <span className="text-stone-500">|</span>{' '}
                                    <span className="text-stone-400">
                                      {booking.client}
                                    </span>
                                  </p>
                                }
                                mobileTrailing={
                                  <div
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusDotClassName(booking.status)}`}
                                    aria-hidden="true"
                                  />
                                }
                                desktopLeading={
                                  <>
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                                      Start
                                    </div>
                                    <div className="mt-0.5 text-base font-semibold tracking-[-0.03em] text-white">
                                      {booking.time}
                                    </div>
                                  </>
                                }
                                desktopBody={
                                  <>
                                    <p className="truncate text-sm font-semibold text-white">
                                      {booking.vehicle}
                                    </p>
                                    <p className="mt-0.5 truncate text-xs text-stone-400">
                                      {booking.client}
                                      <span className="px-1 text-stone-500">
                                        |
                                      </span>
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
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-16 items-center justify-center rounded-2xl border border-dashed border-white/8 bg-black/12 px-4 text-center text-sm text-stone-500 sm:min-h-20">
                        Brak wizyt w tym dniu.
                      </div>
                    )}
                  </div>
                </CollapsibleDetailSection>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function getCountBadgeClassName(count: number) {
  if (count === 0) {
    return 'bg-white/6 text-stone-500';
  }

  if (count >= 4) {
    return 'bg-rose-300/18 text-rose-100';
  }

  return 'bg-emerald-300/16 text-emerald-100';
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
