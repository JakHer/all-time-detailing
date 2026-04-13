import { ImagePlus, Pencil, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Booking } from '../../data/bookings';
import { useGalleryImages } from '../../lib/gallery';
import { GalleryUploadModal } from '../gallery/GalleryUploadModal';
import { ActionButton } from '../ui/ActionButton';
import { StatusBadge } from '../ui/StatusBadge';

type BookingDetailsProps = {
  booking: Booking | undefined;
  onEditClick: () => void;
  onCancelClick: () => void;
  onDeleteClick: () => void;
};

export function BookingDetails({
  booking,
  onEditClick,
  onCancelClick,
  onDeleteClick,
}: BookingDetailsProps) {
  const { data: allImages = [] } = useGalleryImages();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!booking) {
    return (
      <article className="min-h-130 overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-97.5 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          Wybierz rezerwację z listy, aby zobaczyć szczegóły wizyty.
        </div>
      </article>
    );
  }

  const isCancelled = booking.status === 'Anulowana';
  const bookingImages = allImages.filter(
    (img) => img.booking_id === booking.id,
  );
  const beforeImages = bookingImages.filter((img) => img.type === 'Before');
  const afterImages = bookingImages.filter((img) => img.type === 'After');
  const otherImages = bookingImages.filter(
    (img) => img.type !== 'Before' && img.type !== 'After',
  );

  // Infer initial photo type based on booking status
  const initialType =
    booking.status === 'Nowa' || booking.status === 'Potwierdzona'
      ? 'Before'
      : booking.status === 'W realizacji'
        ? 'WIP'
        : booking.status === 'Gotowa do odbioru'
          ? 'After'
          : 'Finished';

  return (
    <>
      <article className="min-h-130 overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szczegóły wizyty
            </p>
            <h3 className="mt-2 wrap-break-word text-3xl font-semibold tracking-[-0.04em] text-white">
              {booking.vehicle}
            </h3>
            <p className="mt-2 break-all text-sm text-stone-400">
              {booking.client} • {booking.phone}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <StatusBadge status={booking.status} className="w-fit" />
            <div className="flex flex-wrap gap-2 md:justify-end">
              <ActionIconButton label="Edytuj wizytę" onClick={onEditClick}>
                <Pencil className="h-4.5 w-4.5" />
              </ActionIconButton>
              <ActionIconButton
                label="Anuluj wizytę"
                onClick={onCancelClick}
                disabled={isCancelled}
                tone="warning"
              >
                <XCircle className="h-4.5 w-4.5" />
              </ActionIconButton>
              <ActionIconButton
                label="Usuń wizytę"
                onClick={onDeleteClick}
                tone="danger"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </ActionIconButton>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Data', value: booking.date },
            { label: 'Godzina', value: booking.time },
            { label: 'Stanowisko', value: booking.bay },
            { label: 'Wartość', value: booking.amount },
            { label: 'Usługa', value: booking.service },
            { label: 'Rejestracja', value: booking.licensePlate },
            ...(booking.vehicleDetails
              ? [{ label: 'Specyfikacja auta', value: booking.vehicleDetails }]
              : []),
          ].map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-[22px] border border-white/8 bg-white/6 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {item.label}
              </p>
              <p className="mt-2 wrap-break-word text-sm leading-7 text-stone-100">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Dokumentacja wizualna ({bookingImages.length})
            </p>
            <ActionButton
              icon={ImagePlus}
              variant="amber"
              className="h-9 px-3 text-xs"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Dodaj zdjęcie
            </ActionButton>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Section: Before */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
                  Przed usługą
                </span>
                <span className="text-[10px] text-stone-500">
                  {beforeImages.length} zdjęć
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {beforeImages.length > 0 ? (
                  beforeImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                    >
                      <img
                        src={img.image_url}
                        alt="Przed"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 text-[11px] text-stone-500">
                    Brak zdjęć "Przed"
                  </div>
                )}
              </div>
            </div>

            {/* Section: After */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">
                  Po usłudze
                </span>
                <span className="text-[10px] text-stone-500">
                  {afterImages.length} zdjęć
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {afterImages.length > 0 ? (
                  afterImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                    >
                      <img
                        src={img.image_url}
                        alt="Po"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 text-[11px] text-stone-500">
                    Brak zdjęć "Po"
                  </div>
                )}
              </div>
            </div>
          </div>

          {otherImages.length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Pozostałe zdjęcia
              </span>
              <div className="flex flex-wrap gap-2">
                {otherImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-white/8 bg-white/5"
                  >
                    <img
                      src={img.image_url}
                      alt="Inne"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {booking.clientNotes ? (
          <div className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              O kliencie
            </p>
            <p className="mt-3 wrap-break-word text-sm leading-7 text-stone-300">
              {booking.clientNotes}
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Notatki zespołu
          </p>
          <p className="mt-3 wrap-break-word text-sm leading-7 text-stone-300">
            {booking.notes}
          </p>
        </div>
      </article>

      <GalleryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialBookingId={booking.id}
        initialVehicleId={booking.vehicleId}
        initialType={initialType}
      />
    </>
  );
}

type ActionIconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'warning' | 'danger';
};

function ActionIconButton({
  children,
  label,
  onClick,
  disabled = false,
  tone = 'default',
}: ActionIconButtonProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-300/20 bg-rose-300/12 text-rose-50 hover:border-rose-300/30 hover:bg-rose-300/18'
      : tone === 'warning'
        ? 'border-amber-200/20 bg-amber-300/12 text-amber-50 hover:border-amber-200/30 hover:bg-amber-300/18'
        : 'border-white/10 bg-white/6 text-white hover:border-white/16 hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${toneClasses} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
