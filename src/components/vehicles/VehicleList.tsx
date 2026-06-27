import type { VehicleListItem } from '../../lib/vehicles';
import { ActionButton } from '../primitives/ActionButton';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';
import { VehicleListEntry } from './VehicleListEntry';

type VehicleListProps = {
  vehicles: VehicleListItem[];
  selectedVehicleId: string | null;
  onSelect: (id: string) => void;
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelect,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: VehicleListProps) {
  return (
    <article className={surfaceStyles.entityList}>
      <div className={layoutStyles.listHeaderDesktop}>
        <div>
          <p className={textStyles.eyebrowAmber}>Lista pojazdow</p>
          <h3 className={textStyles.listTitle}>Baza aut</h3>
        </div>
        <div className={textStyles.listCount}>
          {vehicles.length} z {totalCount} pozycji
        </div>
      </div>

      <div className={layoutStyles.listHeaderMobile}>
        <p className={textStyles.eyebrowMuted}>Lista pojazdow</p>
        <div className={textStyles.listCount}>
          {vehicles.length} z {totalCount}
        </div>
      </div>

      <div className={layoutStyles.listItems}>
        {vehicles.length === 0 ? (
          <div className={surfaceStyles.emptyState}>
            Nie znaleziono pojazdow pasujacych do wyszukiwania.
          </div>
        ) : (
          <>
            {vehicles.map((vehicle) => {
              const isActive = selectedVehicleId === vehicle.id;
              const bookingCount = vehicle.bookings?.length ?? 0;

              return (
                <div key={vehicle.id}>
                  <VehicleListEntry
                    onClick={() => onSelect(vehicle.id)}
                    isActive={isActive}
                    registration={vehicle.registration}
                    make={vehicle.make}
                    model={vehicle.model}
                    ownerName={vehicle.clients.full_name}
                    bookingCount={bookingCount}
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
                    ? 'Doladowywanie pojazdow...'
                    : 'Doladuj kolejne pojazdy'}
                </ActionButton>
              </div>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
