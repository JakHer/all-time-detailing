import type { ClientListItem } from '../../lib/clients';
import { SelectableListItem } from '../entity/SelectableListItem';
import { ActionButton } from '../primitives/ActionButton';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';

type CustomerListProps = {
  customers: ClientListItem[];
  selectedCustomerId: string | null;
  onSelect: (id: string) => void;
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function CustomerList({
  customers,
  selectedCustomerId,
  onSelect,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: CustomerListProps) {
  return (
    <article className={surfaceStyles.entityList}>
      <div className={layoutStyles.listHeaderDesktop}>
        <div>
          <p className={textStyles.eyebrowAmber}>Lista klientow</p>
          <h3 className={textStyles.listTitle}>Baza kontaktow</h3>
        </div>
        <div className={textStyles.listCount}>
          {customers.length} z {totalCount} pozycji
        </div>
      </div>

      <div className={layoutStyles.listHeaderMobile}>
        <p className={textStyles.eyebrowMuted}>Lista klientow</p>
        <div className={textStyles.listCount}>
          {customers.length} z {totalCount}
        </div>
      </div>

      <div className={layoutStyles.listItems}>
        {customers.length === 0 ? (
          <div className={surfaceStyles.emptyState}>
            Nie znaleziono klientow w Twojej bazie.
          </div>
        ) : (
          <>
            {customers.map((customer) => {
              const isActive = selectedCustomerId === customer.id;
              const bookingCount = customer.bookings?.length ?? 0;

              return (
                <div key={customer.id}>
                  <SelectableListItem
                    onClick={() => onSelect(customer.id)}
                    isActive={isActive}
                    mobileLeading={
                      <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                        {bookingCount} wiz.
                      </div>
                    }
                    mobileBody={
                      <p className="truncate text-sm font-medium text-white">
                        {customer.full_name}{' '}
                        <span className="text-stone-500">|</span>{' '}
                        <span className="text-stone-400">{customer.phone}</span>
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
                      <div className="text-base font-semibold tracking-[-0.03em] text-white">
                        {bookingCount} wiz.
                      </div>
                    }
                    desktopBody={
                      <>
                        <p className="truncate text-sm font-semibold text-white">
                          {customer.full_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-stone-400">
                          {customer.phone}
                          <span className="px-1 text-stone-500">|</span>
                          {customer.email || 'Brak e-maila'}
                        </p>
                      </>
                    }
                    desktopTrailing={
                      <p className="truncate text-xs text-stone-300">
                        {customer.vehicles?.length ?? 0} pojazdow
                      </p>
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
                    ? 'Doladowywanie klientow...'
                    : 'Doladuj kolejnych klientow'}
                </ActionButton>
              </div>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
