import { Info, Pencil, Tag, Trash2, X } from 'lucide-react';
import type { Service } from '../../lib/services';
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
import { DetailActionIconButton } from '../ui/DetailActionIconButton';
import { DetailSummaryChip } from '../ui/DetailSummaryChip';
import { Skeleton } from '../ui/Skeleton';

type ServiceDetailsProps = {
  service: Service | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCloseClick?: () => void;
  variant?: 'card' | 'sheet';
};

export function ServiceDetails({
  service,
  isLoading = false,
  onEditClick,
  onDeleteClick,
  onCloseClick,
  variant = 'card',
}: ServiceDetailsProps) {
  const isSheet = variant === 'sheet';
  const headerGapClassName = 'gap-3';
  const titleClassName = isSheet
    ? 'mt-1.5 wrap-break-word text-2xl font-semibold tracking-[-0.04em] text-white'
    : 'mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white';
  const statusMetaClassName = 'mt-1 text-sm text-stone-400';

  if (isLoading) {
    return <Skeleton className="min-h-160 rounded-4xl" />;
  }

  if (!service) {
    return (
      <article className="min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-128 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <Tag className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">Wybierz usluge</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Wybierz usluge z listy, aby zobaczyc szczegoly, opis i parametry.
            </p>
          </div>
        </div>
      </article>
    );
  }

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
            aria-label="Zamknij szczegoly uslugi"
            title="Zamknij szczegoly uslugi"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : null}

      <div
        className={`flex flex-col ${headerGapClassName} md:flex-row md:items-start md:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szczegoly uslugi
            </p>
            {!service.is_active ? (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                Nieaktywna
              </span>
            ) : null}
          </div>
          <h3 className={titleClassName}>{service.name}</h3>
          <p className={statusMetaClassName}>
            {service.is_active ? 'Aktywna usluga' : 'Nieaktywna usluga'}
          </p>
        </div>

        <div className="flex max-w-full shrink-0 flex-wrap gap-2 md:justify-end">
          <DetailActionIconButton label="Edytuj usluge" onClick={onEditClick}>
            <Pencil className="h-4.5 w-4.5" />
          </DetailActionIconButton>
          <DetailActionIconButton
            label="Usun usluge"
            onClick={onDeleteClick}
            tone="danger"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </DetailActionIconButton>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DetailSummaryChip
          label="Cena"
          value={new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
          }).format(service.base_price)}
        />
        <DetailSummaryChip
          label="Czas"
          value={formatServiceDuration(service.duration_minutes)}
        />
      </div>

      <CollapsibleDetailSection
        title="Opis uslugi"
        icon={<Info className="h-4.5 w-4.5" />}
      >
        {service.description ? (
          <p className="wrap-break-word text-sm leading-6 text-stone-300">
            {service.description}
          </p>
        ) : (
          <p className="text-sm italic text-stone-500">Brak opisu uslugi.</p>
        )}
      </CollapsibleDetailSection>
    </article>
  );
}

function formatServiceDuration(durationMinutes: number) {
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }

  const hours = durationMinutes / 60;

  if (Number.isInteger(hours)) {
    return `${hours} h`;
  }

  return `${hours.toFixed(1).replace('.', ',')} h`;
}
