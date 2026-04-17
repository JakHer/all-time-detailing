import { ImagePlus, Pencil, Trash2, X, XCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Booking } from '../../data/bookings';
import { useGalleryImages } from '../../lib/gallery';
import { GalleryUploadModal } from '../gallery/GalleryUploadModal';
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
import { ActionButton } from '../ui/ActionButton';
import { StatusBadge } from '../ui/StatusBadge';

type BookingDetailsProps = {
  booking: Booking | undefined;
  onEditClick: () => void;
  onCancelClick: () => void;
  onDeleteClick: () => void;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
};

export function BookingDetails({
  booking,
  onEditClick,
  onCancelClick,
  onDeleteClick,
  onCloseClick,
  variant = 'card',
}: BookingDetailsProps) {
  const { data: allImages = [] } = useGalleryImages();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isSheet = variant === 'sheet';

  if (!booking) {
    return (
      <article className="min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-128 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          Wybierz rezerwacje z listy, aby zobaczyc szczegoly wizyty.
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

  const initialType =
    booking.status === 'Nowa' || booking.status === 'Potwierdzona'
      ? 'Before'
      : booking.status === 'W realizacji'
        ? 'WIP'
        : booking.status === 'Gotowa do odbioru'
          ? 'After'
          : 'Finished';
  const headerGapClassName = 'gap-3';
  const titleClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl'
    : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white';
  const metaClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-xs text-stone-400'
    : 'mt-1.5 wrap-break-word text-xs text-stone-400';
  const serviceMetaClassName = 'mt-1 text-sm text-stone-400';

  const containerClassName = isSheet
    ? 'w-full max-w-full overflow-hidden'
    : 'min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]';

  return (
    <>
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
              aria-label="Zamknij szczegoly"
              title="Zamknij szczegoly"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : null}

        <div
          className={`flex min-w-0 flex-col ${headerGapClassName} md:flex-row md:items-start md:justify-between`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szczegoly wizyty
            </p>
            <h3 className={titleClassName}>{booking.vehicle}</h3>
            <p className={metaClassName}>
              {booking.client} | {booking.phone}
            </p>
            <p className={serviceMetaClassName}>{booking.service}</p>
          </div>

          <div className="flex max-w-full flex-col items-start gap-3 md:items-end">
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <StatusBadge status={booking.status} className="w-fit" />
            </div>
            <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
              <ActionIconButton label="Edytuj wizyte" onClick={onEditClick}>
                <Pencil className="h-4.5 w-4.5" />
              </ActionIconButton>
              <ActionIconButton
                label="Anuluj wizyte"
                onClick={onCancelClick}
                disabled={isCancelled}
                tone="warning"
              >
                <XCircle className="h-4.5 w-4.5" />
              </ActionIconButton>
              <ActionIconButton
                label="Usun wizyte"
                onClick={onDeleteClick}
                tone="danger"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </ActionIconButton>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <SummaryChip label="Data" value={booking.date} />
          <SummaryChip label="Godzina" value={booking.time} />
          <SummaryChip label="Stanowisko" value={booking.bay} />
          <SummaryChip label="Wartosc" value={booking.amount} />
          <SummaryChip label="Rejestracja" value={booking.licensePlate} />
          {booking.vehicleDetails ? (
            <SummaryChip label="Auto" value={booking.vehicleDetails} />
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Dokumentacja wizualna ({bookingImages.length})
            </p>
            <ActionButton
              icon={ImagePlus}
              variant="amber"
              className="h-9 px-3 text-xs"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Dodaj zdjecie
            </ActionButton>
          </div>

          <CollapsibleDetailSection
            title="Dokumentacja wizualna"
            countLabel={`${bookingImages.length} zdjec`}
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
                      Przed usluga
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {beforeImages.length} zdjec
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
                        Brak zdjec "Przed"
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">
                      Po usludze
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {afterImages.length} zdjec
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
                        Brak zdjec "Po"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {otherImages.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Pozostale zdjecia
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
              ) : null}
            </div>
          </CollapsibleDetailSection>
        </div>

        {booking.clientNotes ? (
          <CollapsibleDetailSection title="O kliencie">
            <p className="wrap-break-word text-sm leading-6 text-stone-300">
              {booking.clientNotes}
            </p>
          </CollapsibleDetailSection>
        ) : null}

        <CollapsibleDetailSection title="Notatki zespolu">
          <p className="wrap-break-word text-sm leading-6 text-stone-300">
            {booking.notes}
          </p>
        </CollapsibleDetailSection>
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
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'warning' | 'danger';
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
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${toneClasses} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
