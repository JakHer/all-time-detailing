import { Calendar, Car, Pencil, Trash2, User, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ClientWithRelations } from '../../lib/clients';
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
import { Skeleton } from '../ui/Skeleton';

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
            <ActionIconButton label="Edytuj klienta" onClick={onEditClick}>
              <Pencil className="h-4.5 w-4.5" />
            </ActionIconButton>
            <ActionIconButton
              label="Usun klienta"
              onClick={onDeleteClick}
              tone="danger"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </ActionIconButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SummaryChip label="Pojazdy" value={String(vehicleCount)} />
        <SummaryChip label="Telefon" value={customer.phone} />
        {customer.email ? (
          <SummaryChip label="E-mail" value={customer.email} />
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
              <div
                key={vehicle.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-white/6 px-2 py-1 text-[10px] font-bold text-white/60">
                    {vehicle.registration}
                  </div>
                  <div className="min-w-0">
                    <p className="wrap-break-word text-sm font-medium text-white">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {vehicle.production_year ?? 'Rok nieznany'}
                    </p>
                  </div>
                </div>
                <p className="min-w-0 max-w-27.5 wrap-break-word text-right text-xs text-stone-500">
                  {vehicle.color || 'Brak koloru'}
                </p>
              </div>
            ))
          ) : (
            <EmptyPanelMessage message="Ten klient nie ma jeszcze przypisanych pojazdow." />
          )}
        </div>
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Historia rezerwacji"
        icon={<Calendar className="h-4.5 w-4.5" />}
        countLabel={`${bookingCount} ${getBookingLabel(bookingCount)}`}
      >
        <div className="grid gap-3">
          {customer.bookings && customer.bookings.length > 0 ? (
            customer.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(booking.scheduled_at).toLocaleTimeString(
                      'pl-PL',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </p>
                </div>
                <p className="max-w-30 text-right text-xs font-semibold text-white/40">
                  {booking.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyPanelMessage message="Brak historii rezerwacji dla tego klienta." />
          )}
        </div>
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

type ActionIconButtonProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      <span className="text-stone-500">{label}:</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
}

function ActionIconButton({
  children,
  label,
  onClick,
  tone = 'default',
}: ActionIconButtonProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-300/20 bg-rose-300/12 text-rose-50 hover:border-rose-300/30 hover:bg-rose-300/18'
      : 'border-white/10 bg-white/6 text-white hover:border-white/16 hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${toneClasses}`}
    >
      {children}
    </button>
  );
}

function EmptyPanelMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-4 text-center text-sm text-stone-500">
      {message}
    </p>
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
