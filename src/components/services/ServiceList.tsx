import type { Service } from '../../lib/services';
import { SelectableListItem } from '../entity/SelectableListItem';
import { ActionButton } from '../primitives/ActionButton';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';

type ServiceListProps = {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function ServiceList({
  services,
  selectedServiceId,
  onSelect,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ServiceListProps) {
  return (
    <article className={surfaceStyles.entityList}>
      <div className={layoutStyles.listHeaderDesktop}>
        <div>
          <p className={textStyles.eyebrowAmber}>Lista uslug</p>
          <h3 className={textStyles.listTitle}>Katalog oferty</h3>
        </div>
        <div className={textStyles.listCount}>
          {services.length} z {totalCount} pozycji
        </div>
      </div>

      <div className={layoutStyles.listHeaderMobile}>
        <p className={textStyles.eyebrowMuted}>Lista uslug</p>
        <div className={textStyles.listCount}>
          {services.length} z {totalCount}
        </div>
      </div>

      <div className={layoutStyles.listItems}>
        {services.length === 0 ? (
          <div className={surfaceStyles.emptyState}>
            Nie znaleziono uslug w katalogu.
          </div>
        ) : (
          <>
            {services.map((service) => {
              const isActive = selectedServiceId === service.id;
              const price = new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN',
              }).format(service.base_price);
              const durationLabel = formatServiceDuration(
                service.duration_minutes,
              );

              return (
                <div key={service.id}>
                  <SelectableListItem
                    onClick={() => onSelect(service.id)}
                    isActive={isActive}
                    mobileLeading={
                      <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                        {durationLabel}
                      </div>
                    }
                    mobileBody={
                      <>
                        <p className="truncate text-sm font-medium text-white">
                          {service.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-amber-200">
                          {price}
                        </p>
                      </>
                    }
                    mobileTrailing={
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          service.is_active ? 'bg-emerald-300' : 'bg-stone-500'
                        }`}
                        aria-hidden="true"
                      />
                    }
                    desktopLeading={
                      <div className="text-base font-semibold tracking-[-0.03em] text-white">
                        {durationLabel}
                      </div>
                    }
                    desktopBody={
                      <>
                        <p className="truncate text-sm font-semibold text-white">
                          {service.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-stone-400">
                          {price}
                        </p>
                      </>
                    }
                    desktopTrailing={
                      <div
                        className={`ml-auto h-2.5 w-2.5 rounded-full ${
                          service.is_active ? 'bg-emerald-300' : 'bg-stone-500'
                        }`}
                        aria-hidden="true"
                      />
                    }
                  />
                </div>
              );
            })}

            {hasNextPage ? (
              <div className="pt-2">
                <ActionButton
                  variant="amber"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full justify-center"
                >
                  {isFetchingNextPage
                    ? 'Doladowywanie uslug...'
                    : 'Doladuj kolejne uslugi'}
                </ActionButton>
              </div>
            ) : null}
          </>
        )}
      </div>
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
