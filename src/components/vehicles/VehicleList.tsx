import type { VehicleWithRelations } from '../../lib/vehicles';
import { SelectableListItem } from '../ui/SelectableListItem';

type VehicleListProps = {
  vehicles: VehicleWithRelations[];
  selectedVehicleId: string | null;
  onSelect: (id: string) => void;
};

export function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelect,
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
        <div className="text-xs text-stone-400">{vehicles.length} pozycji</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista pojazdow
        </p>
        <div className="text-xs text-stone-400">{vehicles.length} pozycji</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {vehicles.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
            Nie znaleziono pojazdow pasujacych do wyszukiwania.
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const isActive = selectedVehicleId === vehicle.id;
            const bookingCount = vehicle.bookings?.length ?? 0;

            return (
              <div key={vehicle.id}>
                <SelectableListItem
                  onClick={() => onSelect(vehicle.id)}
                  isActive={isActive}
                  mobileLeading={
                    <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                      {vehicle.registration}
                    </div>
                  }
                  mobileBody={
                    <p className="truncate text-sm font-medium text-white">
                      {vehicle.make} {vehicle.model}{' '}
                      <span className="text-stone-500">|</span>{' '}
                      <span className="text-stone-400">
                        {vehicle.clients.full_name}
                      </span>
                    </p>
                  }
                  mobileTrailing={
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isActive ? 'bg-amber-300' : 'bg-stone-500'
                      }`}
                      aria-hidden="true"
                    />
                  }
                  desktopLeading={
                    <div className="truncate text-base font-semibold tracking-[-0.03em] text-white">
                      {vehicle.registration}
                    </div>
                  }
                  desktopBody={
                    <>
                      <p className="truncate text-sm font-semibold text-white">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-400">
                        {vehicle.clients.full_name}
                      </p>
                    </>
                  }
                  desktopTrailing={
                    <p className="truncate text-xs text-stone-300">
                      {bookingCount}{' '}
                      {bookingCount === 1
                        ? 'wizyta'
                        : bookingCount < 5
                          ? 'wizyty'
                          : 'wizyt'}
                    </p>
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
