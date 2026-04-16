import type { ClientWithRelations } from '../../lib/clients';

type CustomerListProps = {
  customers: ClientWithRelations[];
  selectedCustomerId: string | null;
  onSelect: (id: string) => void;
};

export function CustomerList({
  customers,
  selectedCustomerId,
  onSelect,
}: CustomerListProps) {
  return (
    <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Lista klientow
          </p>
          <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
            Baza kontaktow
          </h3>
        </div>
        <div className="text-xs text-stone-400">{customers.length} pozycji</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Lista klientow
        </p>
        <div className="text-xs text-stone-400">{customers.length} pozycji</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {customers.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
            Nie znaleziono klientow w Twojej bazie.
          </div>
        ) : (
          customers.map((customer) => {
            const isActive = selectedCustomerId === customer.id;
            const bookingCount = customer.bookings?.length ?? 0;

            return (
              <div key={customer.id}>
                <button
                  type="button"
                  onClick={() => onSelect(customer.id)}
                  className={`grid w-full min-w-0 grid-cols-[4.75rem_minmax(0,1fr)_0.75rem] items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition sm:hidden ${
                    isActive
                      ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
                      : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                  }`}
                >
                  <div className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {bookingCount} wiz.
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {customer.full_name}{' '}
                      <span className="text-stone-500">|</span>{' '}
                      <span className="text-stone-400">{customer.phone}</span>
                    </p>
                  </div>
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      isActive ? 'bg-amber-300' : 'bg-stone-500'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onSelect(customer.id)}
                  className={`hidden w-full min-w-0 max-w-full grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left transition sm:grid ${
                    isActive
                      ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
                      : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Wizyty
                    </div>
                    <div className="mt-0.5 text-base font-semibold tracking-[-0.03em] text-white">
                      {bookingCount}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {customer.full_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-stone-400">
                      {customer.phone}
                      <span className="px-1 text-stone-500">|</span>
                      {customer.email || 'Brak e-maila'}
                    </p>
                  </div>

                  <div className="min-w-0 text-right">
                    <p className="truncate text-xs text-stone-300">
                      {customer.vehicles?.length ?? 0} pojazdow
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-stone-500">
                      kontakt
                    </p>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
