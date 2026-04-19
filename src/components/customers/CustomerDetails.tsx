import { Calendar, Car, Pencil, Trash2, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClientWithRelations } from '../../lib/clients';
import {
  BookingHistoryList,
  type BookingHistoryListItem,
} from '../bookings/BookingHistoryList';
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
import { DetailActionIconButton } from '../ui/DetailActionIconButton';
import { DetailEmptyPanelMessage } from '../ui/DetailEmptyPanelMessage';
import { DetailSummaryChip } from '../ui/DetailSummaryChip';
import { Skeleton } from '../ui/Skeleton';
import { VehicleListEntry } from '../vehicles/VehicleListEntry';

type CustomerDetailsProps = {
  customer: ClientWithRelations | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
};

export function CustomerDetails({
  customer,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  onCloseClick,
  variant = 'card',
}: CustomerDetailsProps) {
  const navigate = useNavigate();
  const isSheet = variant === 'sheet';

  if (isLoading) {
    return <Skeleton className="min-h-160 rounded-4xl" />;
  }

  if (!customer) {
    return (
      <article className="min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-128 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <User className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">
              Wybierz klienta
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Wybierz osobe z listy, aby zobaczyc pelna historie i szczegoly.
            </p>
          </div>
        </div>
      </article>
    );
  }

  const vehicleCount = customer.vehicles?.length ?? 0;
  const bookingCount = customer.bookings?.length ?? 0;
  const lastActivity =
    bookingCount > 0
      ? new Date(customer.bookings[0].scheduled_at).toLocaleDateString('pl-PL')
      : 'Brak';
  const bookingHistoryItems: BookingHistoryListItem[] =
    customer.bookings?.map((booking) => ({
      id: booking.id,
      title: booking.services?.name ?? 'Usluga',
      subtitle: `${formatBookingDate(booking.scheduled_at)} | ${formatBookingTime(booking.scheduled_at)}`,
      meta: formatCustomerBookingMeta(booking),
      status: booking.status,
      onClick: () =>
        navigate(
          `/rezerwacje?booking=${booking.id}&date=${booking.scheduled_at.slice(0, 10)}`,
        ),
    })) ?? [];
  const headerGapClassName = 'gap-3';
  const titleClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-2xl font-semibold tracking-[-0.04em] text-white'
    : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white';
  const metaClassName = isSheet
    ? 'mt-1.5 break-all text-xs text-stone-400'
    : 'mt-1.5 break-all text-xs text-stone-400';
  const activityMetaClassName = 'mt-1 text-sm text-stone-400';
  const containerClassName = isSheet
    ? 'w-full max-w-full overflow-hidden'
    : 'min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]';

  return (
    <article className={containerClassName}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onCloseClick}
            onPointerDown={(event) => {
              event.preventDefault();
              onCloseClick();
            }}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
            aria-label="Zamknij szczegoly klienta"
            title="Zamknij szczegoly klienta"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : null}

      <div
        className={`flex flex-col ${headerGapClassName} md:flex-row md:items-start md:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegoly klienta
          </p>
          <h3 className={titleClassName}>{customer.full_name}</h3>
          <p className={metaClassName}>
            {customer.phone}
            {customer.email ? ` | ${customer.email}` : ''}
          </p>
          <p className={activityMetaClassName}>
            Ostatnia aktywnosc: {lastActivity}
          </p>
        </div>

        <div className="flex max-w-full shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="max-w-full rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-stone-300 md:text-right">
            {bookingCount} {getBookingLabel(bookingCount)} | {vehicleCount}{' '}
            {getVehicleLabel(vehicleCount)}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <DetailActionIconButton
              label="Edytuj klienta"
              onClick={onEditClick}
            >
              <Pencil className="h-4.5 w-4.5" />
            </DetailActionIconButton>
            <DetailActionIconButton
              label="Usun klienta"
              onClick={onDeleteClick}
              tone="danger"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </DetailActionIconButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DetailSummaryChip label="Pojazdy" value={String(vehicleCount)} />
        <DetailSummaryChip label="Telefon" value={customer.phone} />
        {customer.email ? (
          <DetailSummaryChip label="E-mail" value={customer.email} />
        ) : null}
      </div>

      <CollapsibleDetailSection
        title="Pojazdy klienta"
        icon={<Car className="h-4.5 w-4.5" />}
        countLabel={`${vehicleCount} ${getVehicleLabel(vehicleCount)}`}
      >
        <div className="grid gap-3">
          {customer.vehicles && customer.vehicles.length > 0 ? (
            customer.vehicles.map((vehicle) => (
              <VehicleListEntry
                key={vehicle.id}
                onClick={() => navigate(`/pojazdy?vehicle=${vehicle.id}`)}
                registration={vehicle.registration}
                make={vehicle.make}
                model={vehicle.model}
                ownerName={customer.full_name}
                productionYear={vehicle.production_year}
                color={vehicle.color}
                trailingMode="detail"
              />
            ))
          ) : (
            <DetailEmptyPanelMessage message="Ten klient nie ma jeszcze przypisanych pojazdow." />
          )}
        </div>
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Historia rezerwacji"
        icon={<Calendar className="h-4.5 w-4.5" />}
        countLabel={`${bookingCount} ${getBookingLabel(bookingCount)}`}
      >
        <BookingHistoryList
          items={bookingHistoryItems}
          emptyMessage="Brak historii rezerwacji dla tego klienta."
        />
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Notatki"
        icon={<User className="h-4.5 w-4.5" />}
      >
        {customer.notes ? (
          <p className="wrap-break-word text-sm leading-6 text-stone-300">
            {customer.notes}
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            Brak dodatkowych notatek dla tego klienta.
          </p>
        )}
      </CollapsibleDetailSection>
    </article>
  );
}

function getBookingLabel(count: number) {
  return count === 1 ? 'rezerwacja' : 'rezerwacji';
}

function getVehicleLabel(count: number) {
  if (count === 1) return 'pojazd';
  if (count >= 2 && count <= 4) return 'pojazdy';
  return 'pojazdow';
}

function formatBookingDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

function formatBookingTime(value: string) {
  return new Date(value).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(value: number | string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return `${new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)} zl`;
}

function formatCustomerBookingMeta(
  booking: ClientWithRelations['bookings'][number],
) {
  const vehicleLabel = booking.vehicles
    ? `${booking.vehicles.make} ${booking.vehicles.model} (${booking.vehicles.registration})`
    : null;
  const priceLabel = booking.price ? formatPrice(booking.price) : null;

  return [vehicleLabel, priceLabel].filter(Boolean).join(' | ') || undefined;
}
