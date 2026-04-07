import { ChevronRight, Clock, Tag } from 'lucide-react';
import type { Service } from '../../lib/services';

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
  if (services.length === 0) {
    return (
      <div className="w-full max-w-full rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-12 text-center text-sm leading-7 text-stone-400">
        Nie znaleziono usług w katalogu.
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 gap-3">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service.id)}
          className={`group flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-[26px] border p-5 text-left transition-all ${
            selectedServiceId === service.id
              ? 'border-white/20 bg-white/8 shadow-lg ring-1 ring-white/10'
              : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/6'
          }`}
        >
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-white transition-colors group-hover:bg-white/10">
                <Tag className="h-5 w-5 opacity-40" />
              </div>
              <div className="min-w-0">
                <h4 className="wrap-break-word font-semibold text-white transition-colors group-hover:text-white">
                  {service.name}
                </h4>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-400">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="font-medium text-amber-200/80">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                    }).format(service.base_price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!service.is_active && (
                <span className="rounded-full bg-white/4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Nieaktywna
                </span>
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 transition-all ${
                  selectedServiceId === service.id
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
