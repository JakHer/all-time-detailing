import { Calendar, Car, Pencil, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClientWithRelations } from '../../lib/clients';
import {
  BookingHistoryList,
  type BookingHistoryListItem,
} from '../bookings/BookingHistoryList';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import { DetailActionIconButton } from '../details/DetailActionIconButton';
import { DetailEmptyPanelMessage } from '../details/DetailEmptyPanelMessage';
import {
  DetailCloseButton,
  DetailPanel,
  DetailPlaceholder,
} from '../details/DetailPanel';
import { DetailSummaryChip } from '../details/DetailSummaryChip';
import { Skeleton } from '../primitives/Skeleton';
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
      <DetailPlaceholder
        icon={<User className="h-8 w-8 opacity-20" />}
        title="Wybierz klienta"
        message="Wybierz osobe z listy, aby zobaczyc pelna historie i szczegoly."
      />
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
  return (
    <DetailPanel variant={variant}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <DetailCloseButton
            label="Zamknij szczegoly klienta"
            onClick={onCloseClick}
          />
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
    </DetailPanel>
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
