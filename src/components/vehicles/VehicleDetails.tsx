import { Calendar, CarFront, Pencil, Trash2, User } from 'lucide-react';
import type { ReactNode } from 'react';
import type { VehicleWithRelations } from '../../lib/vehicles';
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
import { Skeleton } from '../ui/Skeleton';

type VehicleDetailsProps = {
  vehicle: VehicleWithRelations | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  variant?: 'card' | 'sheet';
};

export function VehicleDetails({
  vehicle,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  variant = 'card',
}: VehicleDetailsProps) {
  const isSheet = variant === 'sheet';

  if (isLoading) {
    return <Skeleton className="min-h-160 rounded-4xl" />;
  }

  if (!vehicle) {
    return (
      <article className="min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-128 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <CarFront className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">Wybierz pojazd</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Kliknij auto z listy, aby zobaczyc wlasciciela, podstawowe dane i
              historie wizyt.
            </p>
          </div>
        </div>
      </article>
    );
  }

  const bookingCount = vehicle.bookings?.length ?? 0;
  const latestBooking = vehicle.bookings?.[0] ?? null;
  const latestVisitLabel = latestBooking
    ? new Date(latestBooking.scheduled_at).toLocaleDateString('pl-PL')
    : 'Brak historii';
  const colorPreviewClassName = getColorPreviewClassName(vehicle.color);
  const headerGapClassName = 'gap-3';
  const titleClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-2xl font-semibold tracking-[-0.04em] text-white'
    : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white';
  const metaClassName = isSheet
    ? 'mt-1.5 break-all text-xs uppercase tracking-[0.16em] text-stone-400'
    : 'mt-1.5 break-all text-xs uppercase tracking-[0.16em] text-stone-400';
  const ownerMetaClassName = 'mt-1 text-sm text-stone-400';
  const containerClassName = isSheet
    ? 'w-full max-w-full overflow-hidden'
    : 'min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]';

  return (
    <article className={containerClassName}>
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
          <p className={ownerMetaClassName}>{vehicle.clients.full_name}</p>
        </div>

        <div className="flex max-w-full shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="max-w-full rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-stone-300 md:text-right">
            {bookingCount} {getBookingLabel(bookingCount)} | ostatnia:{' '}
            {latestVisitLabel}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <ActionIconButton label="Edytuj pojazd" onClick={onEditClick}>
              <Pencil className="h-4.5 w-4.5" />
            </ActionIconButton>
            <ActionIconButton
              label="Usun pojazd"
              onClick={onDeleteClick}
              tone="danger"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </ActionIconButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SummaryChip
          label="Wizyty"
          value={`${bookingCount} ${getBookingLabel(bookingCount)}`}
        />
        <SummaryChip
          label="Rok"
          value={
            vehicle.production_year ? String(vehicle.production_year) : 'Brak'
          }
        />
        <SummaryChip
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
        <p className="text-sm font-medium text-white">
          {vehicle.clients.full_name}
        </p>
        <p className="mt-2 break-all text-sm text-stone-400">
          {vehicle.clients.phone}
        </p>
        {vehicle.clients.email ? (
          <p className="mt-1 break-all text-sm text-stone-500">
            {vehicle.clients.email}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-stone-300">
          {vehicle.clients.notes ||
            'Brak dodatkowych notatek o wlascicielu tego pojazdu.'}
        </p>
      </CollapsibleDetailSection>

      <CollapsibleDetailSection
        title="Historia wizyt"
        icon={<Calendar className="h-4.5 w-4.5" />}
        countLabel={`${bookingCount} ${getBookingLabel(bookingCount)}`}
      >
        <div className="grid gap-3">
          {vehicle.bookings && vehicle.bookings.length > 0 ? (
            vehicle.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {booking.services.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')}{' '}
                    |{' '}
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
            <EmptyPanelMessage message="Ten pojazd nie ma jeszcze historii rezerwacji." />
          )}
        </div>
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
    </article>
  );
}

type ActionIconButtonProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

function SummaryChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      {accent}
      <span className="text-stone-500">{label}:</span>
      <span className="font-medium text-white">{value}</span>
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
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${toneClasses}`}
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
