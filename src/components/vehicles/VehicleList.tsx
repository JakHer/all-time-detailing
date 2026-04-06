import { CarFront, ChevronRight, Hash, User } from 'lucide-react';
import type { VehicleWithRelations } from '../../lib/vehicles';

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
  if (vehicles.length === 0) {
    return (
      <div className="w-full max-w-full rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-12 text-center text-sm leading-7 text-stone-400">
        Nie znaleziono pojazdów pasujących do wyszukiwania.
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 gap-3">
      {vehicles.map((vehicle) => {
        const bookingCount = vehicle.bookings?.length ?? 0;

        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelect(vehicle.id)}
            className={`group flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-[26px] border p-5 text-left transition-all ${
              selectedVehicleId === vehicle.id
                ? 'border-white/20 bg-white/8 shadow-lg ring-1 ring-white/10'
                : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/6'
            }`}
          >
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-white transition-colors group-hover:bg-white/10">
                  <CarFront className="h-5 w-5 opacity-40" />
                </div>
                <div className="min-w-0">
                  <h4 className="wrap-break-word font-semibold text-white">
                    {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="mt-1 grid gap-1 text-sm text-stone-400">
                    <div className="flex min-w-0 items-start gap-1.5">
                      <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="break-all uppercase">
                        {vehicle.registration}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start gap-1.5">
                      <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="wrap-break-word">
                        {vehicle.clients.full_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {bookingCount}{' '}
                  {bookingCount === 1
                    ? 'wizyta'
                    : bookingCount < 5
                      ? 'wizyty'
                      : 'wizyt'}
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 transition-all ${
                    selectedVehicleId === vehicle.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
