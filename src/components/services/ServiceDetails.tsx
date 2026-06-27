import { Info, Pencil, Tag, Trash2 } from 'lucide-react';
import type { Service } from '../../lib/services';
import { CollapsibleDetailSection } from '../details/CollapsibleDetailSection';
import { DetailActionIconButton } from '../details/DetailActionIconButton';
import {
  DetailCloseButton,
  DetailPanel,
  DetailPlaceholder,
} from '../details/DetailPanel';
import { DetailSummaryChip } from '../details/DetailSummaryChip';
import { Skeleton } from '../primitives/Skeleton';

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
      <DetailPlaceholder
        icon={<Tag className="h-8 w-8 opacity-20" />}
        title="Wybierz usluge"
        message="Wybierz usluge z listy, aby zobaczyc szczegoly, opis i parametry."
      />
    );
  }

  return (
    <DetailPanel variant={variant}>
      {!isSheet && onCloseClick ? (
        <div className="mb-3 flex justify-end">
          <DetailCloseButton
            label="Zamknij szczegoly uslugi"
            onClick={onCloseClick}
          />
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
    </DetailPanel>
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
