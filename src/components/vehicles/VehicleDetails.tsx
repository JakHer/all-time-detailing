import { Calendar, CarFront, Pencil, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { VehicleWithRelations } from '../../lib/vehicles';
import {
  BookingHistoryList,
  type BookingHistoryListItem,
} from '../bookings/BookingHistoryList';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import { DetailActionIconButton } from '../details/DetailActionIconButton';
import { DetailLinkRow } from '../details/DetailLinkRow';
import {
  DetailCloseButton,
  DetailPanel,
  DetailPlaceholder,
} from '../details/DetailPanel';
import { DetailSummaryChip } from '../details/DetailSummaryChip';
import { Skeleton } from '../primitives/Skeleton';

type VehicleDetailsProps = {
  vehicle: VehicleWithRelations | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
};

export function VehicleDetails({
  vehicle,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  onCloseClick,
  variant = 'card',
}: VehicleDetailsProps) {
  const navigate = useNavigate();
  const isSheet = variant === 'sheet';

  if (isLoading) {
    return <Skeleton className="min-h-160 rounded-4xl" />;
  }

  if (!vehicle) {
    return (
      <DetailPlaceholder
        icon={<CarFront className="h-8 w-8 opacity-20" />}
        title="Wybierz pojazd"
        message="Kliknij auto z listy, aby zobaczyc wlasciciela, podstawowe dane i historie wizyt."
      />
    );
  }

  const bookingCount = vehicle.bookings?.length ?? 0;
  const latestBooking = vehicle.bookings?.[0] ?? null;
  const latestVisitLabel = latestBooking
    ? new Date(latestBooking.scheduled_at).toLocaleDateString('pl-PL')
    : 'Brak historii';
  const bookingHistoryItems: BookingHistoryListItem[] =
    vehicle.bookings?.map((booking) => ({
      id: booking.id,
      title: booking.services.name,
      subtitle: `${formatBookingDate(booking.scheduled_at)} | ${formatBookingTime(booking.scheduled_at)}`,
      metaActionLabel: booking.clients.full_name,
      metaOnClick: () => navigate(`/klienci?customer=${booking.clients.id}`),
      status: booking.status,
      onClick: () =>
        navigate(
          `/rezerwacje?booking=${booking.id}&date=${booking.scheduled_at.slice(0, 10)}`,
        ),
    })) ?? [];
  const colorPreviewClassName = getColorPreviewClassName(vehicle.color);
  const headerGapClassName = 'gap-3';
  const titleClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-2xl font-semibold tracking-[-0.04em] text-white'
    : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white';
  const metaClassName = isSheet
    ? 'mt-1.5 break-all text-xs uppercase tracking-[0.16em] text-stone-400'
    : 'mt-1.5 break-all text-xs uppercase tracking-[0.16em] text-stone-400';
  const ownerMetaClassName = 'mt-1 text-sm text-stone-400';
  return (
    <DetailPanel variant={variant}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <DetailCloseButton
            label="Zamknij szczegoly pojazdu"
            onClick={onCloseClick}
          />
        </div>
      ) : null}

      <div
        className={`flex flex-col ${headerGapClassName} md:flex-row md:items-start md:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegoly pojazdu
          </p>
          <h3 className={titleClassName}>
            {vehicle.make} {vehicle.model}
          </h3>
          <p className={metaClassName}>{vehicle.registration}</p>
          <button
            type="button"
            onClick={() => navigate(`/klienci?customer=${vehicle.clients.id}`)}
            className={`max-w-fit text-left ${ownerMetaClassName} transition hover:text-stone-200`}
          >
            {vehicle.clients.full_name}
          </button>
        </div>

        <div className="flex max-w-full shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="max-w-full rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-stone-300 md:text-right">
            {bookingCount} {getBookingLabel(bookingCount)} | ostatnia:{' '}
            {latestVisitLabel}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <DetailActionIconButton label="Edytuj pojazd" onClick={onEditClick}>
              <Pencil className="h-4.5 w-4.5" />
            </DetailActionIconButton>
            <DetailActionIconButton
              label="Usun pojazd"
              onClick={onDeleteClick}
              tone="danger"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </DetailActionIconButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DetailSummaryChip
          label="Wizyty"
          value={`${bookingCount} ${getBookingLabel(bookingCount)}`}
        />
        <DetailSummaryChip
          label="Rok"
          value={
            vehicle.production_year ? String(vehicle.production_year) : 'Brak'
          }
        />
        <DetailSummaryChip
          label="Kolor"
          value={vehicle.color || 'Brak'}
          accent={
            vehicle.color ? (
              <span
                aria-hidden="true"
                className={`h-3 w-3 shrink-0 rounded-full ${colorPreviewClassName}`}
              />
            ) : null
          }
        />
      </div>

      <CollapsibleDetailSection
        title="Wlasciciel i kontekst"
        icon={<User className="h-4.5 w-4.5" />}
      >
        <div className="space-y-3">
          <DetailLinkRow
            label="Przejdz do klienta"
            description={`${vehicle.clients.full_name} | ${vehicle.clients.phone}`}
            onClick={() => navigate(`/klienci?customer=${vehicle.clients.id}`)}
          />
          <p className="break-all text-sm text-stone-400">
            {vehicle.clients.phone}
          </p>
          {vehicle.clients.email ? (
            <p className="break-all text-sm text-stone-500">
              {vehicle.clients.email}
            </p>
          ) : null}
          <p className="text-sm leading-6 text-stone-300">
            {vehicle.clients.notes ||
              'Brak dodatkowych notatek o wlascicielu tego pojazdu.'}
          </p>
        </div>
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Historia wizyt"
        icon={<Calendar className="h-4.5 w-4.5" />}
        countLabel={`${bookingCount} ${getBookingLabel(bookingCount)}`}
      >
        <BookingHistoryList
          items={bookingHistoryItems}
          emptyMessage="Ten pojazd nie ma jeszcze historii rezerwacji."
        />
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Notatki"
        icon={<CarFront className="h-4.5 w-4.5" />}
      >
        {vehicle.notes ? (
          <p className="wrap-break-word text-sm leading-6 text-stone-300">
            {vehicle.notes}
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            Brak dodatkowych notatek dla tego pojazdu.
          </p>
        )}
      </CollapsibleDetailSection>
    </DetailPanel>
  );
}

function getBookingLabel(count: number) {
  if (count === 1) return 'wizyta';
  if (count >= 2 && count <= 4) return 'wizyty';
  return 'wizyt';
}

function getColorPreviewClassName(color: string | null) {
  const value = (color ?? '').trim().toLowerCase();

  if (value.includes('czarn'))
    return 'bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]';
  if (value.includes('bia')) return 'bg-white';
  if (
    value.includes('szar') ||
    value.includes('srebr') ||
    value.includes('grafit')
  )
    return 'bg-slate-400';
  if (value.includes('granat') || value.includes('niebies'))
    return 'bg-blue-600';
  if (value.includes('czerw')) return 'bg-red-600';
  if (value.includes('ziel')) return 'bg-emerald-600';
  if (value.includes('zol') || value.includes('żół')) return 'bg-yellow-400';
  if (value.includes('bez') || value.includes('krem')) return 'bg-amber-100';
  if (value.includes('braz') || value.includes('brąz')) return 'bg-amber-700';
  if (value.includes('fiolet') || value.includes('purpur'))
    return 'bg-violet-500';
  if (value.includes('pomaran')) return 'bg-orange-500';

  return 'bg-stone-500';
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
