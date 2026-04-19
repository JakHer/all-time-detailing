import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerModal } from '../components/customers/CustomerModal';
import { CustomerToolbar } from '../components/customers/CustomerToolbar';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { scrollPageToTop } from '../lib/scroll';
import {
  useClients,
  useClient,
  useCreateClient,
  useCustomerMetrics,
  useDeleteClient,
  useUpdateClient,
  type ClientWithRelations,
  type NewClient,
} from '../lib/clients';

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDesktopDetailsLayout, setIsDesktopDetailsLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1536px)').matches
      : false,
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const clientsQuery = useClients(deferredQuery);
  const { data: metricsData } = useCustomerMetrics();
  const selectedCustomerQuery = useClient(selectedCustomerId ?? '');
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 1536px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktopDetailsLayout(event.matches);
    };

    setIsDesktopDetailsLayout(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktopDetailsLayout) {
      setIsMobileDetailsOpen(false);
    }
  }, [isDesktopDetailsLayout]);

  useEffect(() => {
    const customerIdFromQuery = searchParams.get('customer');

    if (!customerIdFromQuery) {
      return;
    }

    setSelectedCustomerId(customerIdFromQuery);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
    scrollPageToTop();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('customer');
    setSearchParams(nextParams, { replace: true });
  }, [isDesktopDetailsLayout, searchParams, setSearchParams]);

  const clients = clientsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalClients = clientsQuery.data?.pages[0]?.totalCount ?? 0;
  const returnTo = searchParams.get('returnTo');
  const selectedCustomer = selectedCustomerQuery.data ?? null;
  const isListLoading = clientsQuery.isLoading;
  const isInitialLoading =
    clientsQuery.isLoading ||
    (selectedCustomerId !== null && selectedCustomerQuery.isLoading);

  const metrics = useMemo(
    () => [
      {
        label: 'Aktywni klienci',
        value: String(metricsData?.totalClients ?? totalClients),
      },
      {
        label: 'Nowi (30 dni)',
        value: String(metricsData?.newClientsLast30Days ?? 0),
      },
      {
        label: 'Powracajacy',
        value: `${Math.round(metricsData?.returningRate ?? 0)}%`,
      },
      {
        label: 'Sr. wartosc',
        value: formatCurrency(metricsData?.averageBookingValue ?? 0),
      },
    ],
    [metricsData, totalClients],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedCustomerId) {
      return;
    }

    setIsMobileDetailsOpen(false);
    setModalMode('edit');
    setIsModalOpen(true);
  }

  function handleDeleteClick() {
    if (!selectedCustomerId) {
      return;
    }

    setIsDeleteDialogOpen(true);
  }

  async function handleModalSubmit(data: NewClient) {
    try {
      if (modalMode === 'edit' && selectedCustomerId) {
        await updateMutation.mutateAsync({ ...data, id: selectedCustomerId });
        toast.success('Dane klienta zostaly zaktualizowane');
      } else {
        const newClient = await createMutation.mutateAsync(data);
        setSelectedCustomerId(newClient.id);
        toast.success('Nowy klient zostal dodany');
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Wystapil blad podczas zapisywania klienta');
    }
  }

  async function confirmDelete() {
    if (!selectedCustomerId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedCustomerId);
      setSelectedCustomerId(null);
      setIsDeleteDialogOpen(false);
      setIsMobileDetailsOpen(false);
      toast.success('Klient zostal usuniety');
    } catch {
      toast.error(
        'Nie mozna usunac klienta, poniewaz prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  function handleSelectCustomer(id: string) {
    setSelectedCustomerId(id);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
    scrollPageToTop();
  }

  function closeCustomerDetails() {
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    setSelectedCustomerId(null);
    setIsMobileDetailsOpen(false);
  }

  const shouldShowCustomerDetails = selectedCustomerId !== null;

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <div className="hidden sm:block">
        <PageIntro eyebrow="Klienci" title="Baza klientow" metrics={metrics} />
      </div>

      <MobilePageHeader
        eyebrow="Klienci"
        title="Baza klientow"
        chips={[
          `${metricsData?.totalClients ?? totalClients} osob`,
          `${Math.round(metricsData?.returningRate ?? 0)}% powracalnosc`,
        ]}
      />

      <CustomerToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section
        className={`grid min-h-180 min-w-0 gap-6 ${
          shouldShowCustomerDetails
            ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
            : ''
        }`}
        style={{ overflowAnchor: 'none' }}
      >
        <div className="min-w-0 max-w-full">
          {isListLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <CustomerList
              customers={clients}
              selectedCustomerId={selectedCustomerId}
              onSelect={handleSelectCustomer}
              totalCount={totalClients}
              hasNextPage={clientsQuery.hasNextPage ?? false}
              isFetchingNextPage={clientsQuery.isFetchingNextPage}
              onLoadMore={() => {
                void clientsQuery.fetchNextPage();
              }}
            />
          )}
        </div>

        <div
          className={`min-w-0 max-w-full ${
            shouldShowCustomerDetails ? 'hidden 2xl:block' : 'hidden'
          }`}
          style={{ overflowAnchor: 'none' }}
        >
          <CustomerDetails
            customer={selectedCustomer}
            isLoading={isInitialLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeCustomerDetails}
          />
        </div>
      </section>

      <Dialog.Root
        open={
          !isDesktopDetailsLayout && isMobileDetailsOpen && !!selectedCustomerId
        }
        onOpenChange={(open) => {
          if (open) {
            setIsMobileDetailsOpen(true);
            return;
          }

          closeCustomerDetails();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm 2xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-70 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none 2xl:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Szczegoly klienta
                </p>
                <p className="mt-1 truncate text-sm text-stone-400">
                  {selectedCustomer?.full_name ?? 'Wybrany klient'}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                  aria-label="Zamknij szczegoly klienta"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CustomerDetails
                customer={selectedCustomer}
                isLoading={isInitialLoading}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                variant="sheet"
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={
          modalMode === 'edit'
            ? (selectedCustomer as ClientWithRelations | null)
            : null
        }
        title={
          modalMode === 'edit' ? 'Edytuj dane klienta' : 'Dodaj nowego klienta'
        }
      />

      {isDeleteDialogOpen ? (
        <ConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
          title="Usun klienta"
          description={`Czy na pewno chcesz usunac klienta ${selectedCustomer?.full_name}? Tej operacji nie mozna cofnac.`}
          confirmLabel="Usun klienta"
          tone="danger"
        />
      ) : null}
    </div>
  );
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)} zl`;
}
