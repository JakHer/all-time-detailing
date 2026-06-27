import type { Booking } from '../../data/bookings';
import {
  formatMonthLabel,
  getTodayDateString,
  getMonthMatrix,
  isSameMonth,
} from '../../lib/dateUtils';
import { surfaceStyles, textStyles } from '../design/styles';

type BookingMonthViewProps = {
  bookings: Booking[];
  selectedDate: string;
  onDaySelect: (dateString: string) => void;
};

export function BookingMonthView({
  bookings,
  selectedDate,
  onDaySelect,
}: BookingMonthViewProps) {
  const today = getTodayDateString();
  const monthMatrix = getMonthMatrix(selectedDate);

  return (
    <article className={surfaceStyles.entityList}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={textStyles.eyebrowAmber}>Miesiac</p>
          <h3 className={textStyles.listTitle}>
            {formatMonthLabel(selectedDate)}
          </h3>
        </div>
        <div className={textStyles.listCount}>
          {bookings.length} wizyt w miesiacu
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] lg:rounded-4xl">
        <div className="grid grid-cols-7 border-b border-white/8">
          {['Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob', 'Nd'].map((day) => (
            <div
              key={day}
              className="px-1.5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:px-3 sm:py-4 sm:text-[11px] sm:tracking-[0.22em]"
            >
              <span className="sm:hidden">{getMobileWeekdayLabel(day)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthMatrix.flat().map((dateString) => {
            const dayBookings = bookings.filter(
              (booking) => booking.date === dateString,
            );
            const isCurrentMonth = isSameMonth(dateString, selectedDate);
            const isToday = dateString === today && isCurrentMonth;

            return (
              <button
                key={dateString}
                type="button"
                onClick={() => onDaySelect(dateString)}
                className={`min-h-[4.9rem] border-r border-t border-white/8 px-2 py-2 text-left transition last:border-r-0 hover:bg-white/[0.03] sm:min-h-[8.5rem] sm:px-3 sm:py-3 xl:min-h-36 ${
                  isToday
                    ? 'bg-amber-300/8 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.08)]'
                    : ''
                } ${!isCurrentMonth ? 'text-stone-600' : ''}`}
              >
                <div className="flex items-start">
                  <div className="relative">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 sm:text-sm ${
                        isToday
                          ? 'bg-amber-300 text-black'
                          : isCurrentMonth
                            ? 'bg-white/6 text-white'
                            : 'bg-white/4 text-stone-500'
                      }`}
                    >
                      {dateString.slice(-2)}
                    </span>
                    {dayBookings.length > 0 ? (
                      <>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#1f2022] sm:hidden ${getMobileMonthDotClassName(
                            dayBookings.length,
                          )}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`absolute -bottom-1 -right-2 hidden sm:inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1f2022] px-1.5 text-[10px] font-semibold ${getDayLoadClassName(
                            dayBookings.length,
                            isToday,
                          )}`}
                          title={`${dayBookings.length} ${dayBookings.length === 1 ? 'wizyta' : dayBookings.length < 5 ? 'wizyty' : 'wizyt'}`}
                        >
                          {dayBookings.length}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function getDayLoadClassName(count: number, isSelected = false) {
  if (count === 0) {
    return isSelected
      ? 'bg-black/18 text-black/65'
      : 'bg-white/6 text-stone-500';
  }

  if (count >= 4) {
    return 'bg-rose-300/18 text-rose-100';
  }

  return 'bg-emerald-300/16 text-emerald-100';
}

function getMobileMonthDotClassName(count: number) {
  if (count >= 4) {
    return 'bg-rose-300/90';
  }

  return 'bg-emerald-300/90';
}

function getMobileWeekdayLabel(day: string) {
  switch (day) {
    case 'Pon':
      return 'Pn';
    case 'Wt':
      return 'Wt';
    case 'Sr':
      return 'Sr';
    case 'Czw':
      return 'Cz';
    case 'Pt':
      return 'Pt';
    case 'Sob':
      return 'So';
    case 'Nd':
      return 'Nd';
    default:
      return day;
  }
}
