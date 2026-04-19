import type { Service } from '../../lib/services';
import { SelectableListItem } from '../ui/SelectableListItem';

type ServiceListProps = {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
};

export function ServiceList({
  services,
  selectedServiceId,
  onSelect,
}: ServiceListProps) {
  return (
    <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Lista uslug
          </p>
          <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Katalog oferty
          </h3>
        </div>
        <div className="text-xs text-stone-400">{services.length} pozycji</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista uslug
        </p>
        <div className="text-xs text-stone-400">{services.length} pozycji</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {services.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
            Nie znaleziono uslug w katalogu.
          </div>
        ) : (
          services.map((service) => {
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
          })
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
