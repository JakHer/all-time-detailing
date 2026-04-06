import { Calendar, Car, Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import type { ClientWithRelations } from '../../lib/clients';
import { Skeleton } from '../ui/Skeleton';

type CustomerDetailsProps = {
  customer: ClientWithRelations | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

export function CustomerDetails({
  customer,
  isLoading = false,
  onEditClick,
  onDeleteClick,
}: CustomerDetailsProps) {
  if (isLoading) {
    return <Skeleton className="min-h-180 rounded-4xl" />;
  }

  if (!customer) {
    return (
      <article className="min-h-180 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-147.5 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <User className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">
              Wybierz klienta
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Wybierz osobę z listy po lewej, aby zobaczyć pełną historię i
              szczegóły.
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

  return (
    <article className="min-h-180 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Szczegóły klienta
          </p>
          <h3 className="mt-2 wrap-break-word text-3xl font-semibold tracking-[-0.04em] text-white">
            {customer.full_name}
          </h3>
          <p className="mt-2 break-all text-sm text-stone-400">
            {customer.phone}
            {customer.email ? ` • ${customer.email}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-stone-300">
            {bookingCount} {getBookingLabel(bookingCount)} • {vehicleCount}{' '}
            {getVehicleLabel(vehicleCount)}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <ActionIconButton label="Edytuj klienta" onClick={onEditClick}>
              <Pencil className="h-4.5 w-4.5" />
            </ActionIconButton>
            <ActionIconButton
              label="Usuń klienta"
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
          icon={<Phone className="h-4.5 w-4.5" />}
          label="Telefon"
          value={customer.phone}
        />
        <InfoCard
          icon={<Mail className="h-4.5 w-4.5" />}
          label="E-mail"
          value={customer.email || 'Brak adresu e-mail'}
        />
        <InfoCard
          icon={<Car className="h-4.5 w-4.5" />}
          label="Pojazdy"
          value={String(vehicleCount)}
        />
        <InfoCard
          icon={<Calendar className="h-4.5 w-4.5" />}
          label="Ostatnia aktywność"
          value={lastActivity}
        />
      </div>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Car className="h-4.5 w-4.5 opacity-40" />
          <h3>Pojazdy klienta</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {customer.vehicles && customer.vehicles.length > 0 ? (
            customer.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-white/6 px-2 py-1 text-[10px] font-bold text-white/60">
                    {vehicle.registration}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-white">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {vehicle.production_year ?? 'Rok nieznany'}
                    </p>
                  </div>
                </div>
                <p className="max-w-[110px] break-words text-right text-xs text-stone-500">
                  {vehicle.color || 'Brak koloru'}
                </p>
              </div>
            ))
          ) : (
            <EmptyPanelMessage message="Ten klient nie ma jeszcze przypisanych pojazdów." />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Calendar className="h-4.5 w-4.5 opacity-40" />
          <h3>Historia rezerwacji</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {customer.bookings && customer.bookings.length > 0 ? (
            customer.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 p-4"
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
                <p className="shrink-0 text-xs font-semibold text-white/40">
                  {booking.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyPanelMessage message="Brak historii rezerwacji dla tego klienta." />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Relacja
        </p>
        <h3 className="mt-2 font-semibold text-white">Notatki</h3>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/6 p-4">
          {customer.notes ? (
            <p className="break-words text-sm leading-7 text-stone-300">
              {customer.notes}
            </p>
          ) : (
            <p className="text-sm text-stone-500">
              Brak dodatkowych notatek dla tego klienta.
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
};

type ActionIconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/4 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
          {label}
        </p>
        <p className="mt-2 break-all text-sm leading-7 text-stone-100">
          {value}
        </p>
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

type EmptyPanelMessageProps = {
  message: string;
};

function EmptyPanelMessage({ message }: EmptyPanelMessageProps) {
  return (
    <p className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-6 text-center text-sm text-stone-500">
      {message}
    </p>
  );
}

function getBookingLabel(count: number) {
  return count === 1 ? 'rezerwacja' : 'rezerwacji';
}

function getVehicleLabel(count: number) {
  if (count === 1) {
    return 'pojazd';
  }

  if (count >= 2 && count <= 4) {
    return 'pojazdy';
  }

  return 'pojazdów';
}
