import type { BookingStatus } from '../../data/bookings';

const statusStyles: Record<BookingStatus, string> = {
  Nowa: 'border-sky-300/20 bg-sky-300/12 text-sky-100',
  Potwierdzona: 'border-amber-300/20 bg-amber-300/12 text-amber-100',
  'W realizacji': 'border-violet-300/20 bg-violet-300/12 text-violet-100',
  'Gotowa do odbioru':
    'border-emerald-300/20 bg-emerald-300/12 text-emerald-100',
  Anulowana: 'border-rose-300/20 bg-rose-300/12 text-rose-100',
};

type StatusBadgeProps = {
  status: BookingStatus;
  className?: string;
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
