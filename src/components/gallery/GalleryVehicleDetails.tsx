import { ChevronRight, Clock, X } from 'lucide-react';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import type { VehicleGallery } from './galleryTypes';

type GalleryVehicleDetailsProps = {
  vehicle: VehicleGallery;
  selectedRealizationId: string | null;
  onSelectRealization: (realizationId: string) => void;
  onClose: () => void;
};

export const GalleryVehicleDetails = ({
  vehicle,
  selectedRealizationId,
  onSelectRealization,
  onClose,
}: GalleryVehicleDetailsProps) => {
  return (
    <article className="min-h-160 w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl md:p-7">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(event) => {
            event.preventDefault();
            onClose();
          }}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
          aria-label="Zamknij szczegoly galerii"
          title="Zamknij szczegoly galerii"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 sm:block">
            Biblioteka pojazdu
          </p>
          <h3 className="mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="mt-1.5 break-all text-xs text-stone-400">
            {vehicle.clientName} | {vehicle.registration}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <div className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-stone-300">
            {vehicle.realizations.length} realizacje | {vehicle.totalPhotos}{' '}
            zdjec
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SummaryChip
          label="Realizacje"
          value={`${vehicle.realizations.length}`}
        />
        <SummaryChip label="Zdjecia" value={`${vehicle.totalPhotos}`} />
      </div>

      <CollapsibleDetailSection
        title="Os czasu realizacji"
        icon={<Clock className="h-4.5 w-4.5" />}
        countLabel={`${vehicle.realizations.length} wpisow`}
        defaultOpen
      >
        <div className="grid gap-3">
          {vehicle.realizations.map((realization) => (
            <button
              key={realization.id}
              type="button"
              onClick={() => onSelectRealization(realization.id)}
              className={`group flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                selectedRealizationId === realization.id
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/8 bg-white/6 hover:border-white/16 hover:bg-white/10'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/6">
                  <img
                    src={
                      realization.images.find((image) => image.type === 'After')
                        ?.image_url ?? realization.images[0].image_url
                    }
                    alt={realization.title}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest ${
                        realization.isIndependent
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {realization.isIndependent ? 'Projekt' : 'Realizacja'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      | {realization.date}
                    </span>
                  </div>
                  <h4 className="mt-1 wrap-break-word text-sm font-semibold text-white">
                    {realization.title}
                  </h4>
                  <p className="mt-1 text-xs text-stone-500">
                    {realization.images.length} zdjec w tej realizacji
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4.5 w-4.5 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </button>
          ))}
        </div>
      </CollapsibleDetailSection>
    </article>
  );
};

const SummaryChip = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      <span className="text-stone-500">{label}:</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
};
