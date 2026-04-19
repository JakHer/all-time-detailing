import type { VehicleListItem } from '../../lib/vehicles';
import { ActionButton } from '../ui/ActionButton';
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
    <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Lista pojazdow
          </p>
          <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Baza aut
          </h3>
        </div>
        <div className="text-xs text-stone-400">
          {vehicles.length} z {totalCount} pozycji
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista pojazdow
        </p>
        <div className="text-xs text-stone-400">
          {vehicles.length} z {totalCount}
        </div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {vehicles.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
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
