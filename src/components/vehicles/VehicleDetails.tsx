import {
  Calendar,
  CarFront,
  Palette,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import type { VehicleWithRelations } from '../../lib/vehicles';
import { Skeleton } from '../ui/Skeleton';

type VehicleDetailsProps = {
  vehicle: VehicleWithRelations | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

export function VehicleDetails({
  vehicle,
  isLoading = false,
  onEditClick,
  onDeleteClick,
}: VehicleDetailsProps) {
  if (isLoading) {
    return <Skeleton className="min-h-180 rounded-4xl" />;
  }

  if (!vehicle) {
    return (
      <article className="min-h-180 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-147.5 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <CarFront className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">Wybierz pojazd</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Kliknij auto z listy po lewej, aby zobaczyć właściciela,
              podstawowe dane i historię wizyt.
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

  return (
    <article className="min-h-180 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegóły pojazdu
          </p>
          <h3 className="mt-2 wrap-break-word text-3xl font-semibold tracking-[-0.04em] text-white">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="mt-2 break-all text-sm uppercase tracking-[0.18em] text-stone-400">
            {vehicle.registration}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-stone-300">
            {bookingCount} {getBookingLabel(bookingCount)} • ostatnia:{' '}
            {latestVisitLabel}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <ActionIconButton label="Edytuj pojazd" onClick={onEditClick}>
              <Pencil className="h-4.5 w-4.5" />
            </ActionIconButton>
            <ActionIconButton
              label="Usuń pojazd"
              onClick={onDeleteClick}
              tone="danger"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </ActionIconButton>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<User className="h-4 w-4" />}
          label="Właściciel"
          value={vehicle.clients.full_name}
        />
        <InfoCard
          icon={<Palette className="h-4 w-4" />}
          label="Kolor"
          value={vehicle.color || 'Nie uzupełniono'}
          accent={
            vehicle.color ? (
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-[#161719] ${colorPreviewClassName}`}
              />
            ) : null
          }
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Rok produkcji"
          value={
            vehicle.production_year
              ? String(vehicle.production_year)
              : 'Nie uzupełniono'
          }
        />
        <InfoCard
          icon={<CarFront className="h-4 w-4" />}
          label="Wizyty"
          value={`${bookingCount} ${getBookingLabel(bookingCount)}`}
        />
      </div>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <User className="h-4.5 w-4.5 opacity-40" />
          <h3>Właściciel i kontekst</h3>
        </div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/6 p-4">
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
          <p className="mt-4 text-sm leading-7 text-stone-300">
            {vehicle.clients.notes ||
              'Brak dodatkowych notatek o właścicielu tego pojazdu.'}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Calendar className="h-4.5 w-4.5 opacity-40" />
          <h3>Historia wizyt</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {vehicle.bookings && vehicle.bookings.length > 0 ? (
            vehicle.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {booking.services.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')}{' '}
                    •{' '}
                    {new Date(booking.scheduled_at).toLocaleTimeString(
                      'pl-PL',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-white/40">
                  {booking.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyPanelMessage message="Ten pojazd nie ma jeszcze historii rezerwacji." />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Kartoteka auta
        </p>
        <h3 className="mt-2 font-semibold text-white">Notatki</h3>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/6 p-4">
          {vehicle.notes ? (
            <p className="wrap-break-word text-sm leading-7 text-stone-300">
              {vehicle.notes}
            </p>
          ) : (
            <p className="text-sm text-stone-500">
              Brak dodatkowych notatek dla tego pojazdu.
            </p>
          )}
        </div>
      </section>
    </article>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: React.ReactNode;
};

type ActionIconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

function InfoCard({ icon, label, value, accent }: InfoCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/6 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/4 text-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
          {label}
        </p>
        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          {accent}
          <p className="wrap-break-word text-sm font-medium leading-6 text-stone-100">
            {value}
          </p>
        </div>
      </div>
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
    <p className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-6 text-center text-sm text-stone-500">
      {message}
    </p>
  );
}

function getBookingLabel(count: number) {
  if (count === 1) {
    return 'wizyta';
  }

  if (count >= 2 && count <= 4) {
    return 'wizyty';
  }

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
