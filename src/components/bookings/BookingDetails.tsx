import { ImagePlus, Pencil, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../data/bookings';
import { useGalleryImages } from '../../lib/gallery';
import { GalleryUploadModal } from '../gallery/GalleryUploadModal';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import { ActionButton } from '../primitives/ActionButton';
import { DetailActionIconButton } from '../details/DetailActionIconButton';
import { DetailLinkRow } from '../details/DetailLinkRow';
import {
  DetailCloseButton,
  DetailPanel,
  DetailPlaceholder,
} from '../details/DetailPanel';
import { DetailSummaryChip } from '../details/DetailSummaryChip';
import { StatusBadge } from '../primitives/StatusBadge';

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
  const navigate = useNavigate();
  const { data: allImages = [] } = useGalleryImages();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isSheet = variant === 'sheet';
  const returnTo = booking
    ? encodeURIComponent(
        `/rezerwacje?booking=${booking.id}&date=${booking.date}`,
      )
    : '';

  if (!booking) {
    return (
      <DetailPlaceholder message="Wybierz rezerwacje z listy, aby zobaczyc szczegoly wizyty." />
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

  return (
    <>
      <DetailPanel variant={variant}>
        {!isSheet && onCloseClick ? (
          <div className="mb-3 flex justify-end">
            <DetailCloseButton
              label="Zamknij szczegoly"
              onClick={onCloseClick}
            />
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
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/klienci?customer=${booking.clientId}&returnTo=${returnTo}`,
                  )
                }
                className="inline text-left transition hover:text-stone-200"
              >
                {booking.client}
              </button>{' '}
              | {booking.phone}
            </p>
            <p className={serviceMetaClassName}>{booking.service}</p>
          </div>

          <div className="flex max-w-full flex-col items-start gap-3 md:items-end">
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <StatusBadge status={booking.status} className="w-fit" />
            </div>
            <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
              <DetailActionIconButton
                label="Edytuj wizyte"
                onClick={onEditClick}
              >
                <Pencil className="h-4.5 w-4.5" />
              </DetailActionIconButton>
              <DetailActionIconButton
                label="Anuluj wizyte"
                onClick={onCancelClick}
                disabled={isCancelled}
                tone="warning"
              >
                <XCircle className="h-4.5 w-4.5" />
              </DetailActionIconButton>
              <DetailActionIconButton
                label="Usun wizyte"
                onClick={onDeleteClick}
                tone="danger"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </DetailActionIconButton>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <DetailSummaryChip label="Data" value={booking.date} />
          <DetailSummaryChip label="Godzina" value={booking.time} />
          <DetailSummaryChip label="Stanowisko" value={booking.bay} />
          <DetailSummaryChip label="Wartosc" value={booking.amount} />
          <DetailSummaryChip label="Rejestracja" value={booking.licensePlate} />
          {booking.vehicleDetails ? (
            <DetailSummaryChip label="Auto" value={booking.vehicleDetails} />
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
            <div className="space-y-3">
              <DetailLinkRow
                label="Przejdz do klienta"
                description={`${booking.client} | ${booking.phone}`}
                onClick={() =>
                  navigate(
                    `/klienci?customer=${booking.clientId}&returnTo=${returnTo}`,
                  )
                }
              />
              <p className="wrap-break-word text-sm leading-6 text-stone-300">
                {booking.clientNotes}
              </p>
            </div>
          </CollapsibleDetailSection>
        ) : null}

        <CollapsibleDetailSection title="Notatki zespolu">
          <p className="wrap-break-word text-sm leading-6 text-stone-300">
            {booking.notes}
          </p>
        </CollapsibleDetailSection>
      </DetailPanel>

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
