import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerModal } from '../components/customers/CustomerModal';
import { CustomerToolbar } from '../components/customers/CustomerToolbar';
import { PageIntro } from '../components/common/PageIntro';
import { ConfirmDialog } from '../components/primitives/ConfirmDialog';
import { ListSkeleton } from '../components/entity/ListSkeleton';
import { MasterDetailLayout } from '../components/layout/MasterDetailLayout';
import { MobileDetailSheet } from '../components/layout/MobileDetailSheet';
import { MobilePageHeader } from '../components/common/MobilePageHeader';
import { useResponsiveDetailsPanel } from '../components/layout/useResponsiveDetailsPanel';
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
  const {
    isDesktopDetailsLayout,
    isMobileDetailsOpen,
    setIsMobileDetailsOpen,
    openDetailsForCurrentLayout,
    closeMobileDetails,
  } = useResponsiveDetailsPanel();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const clientsQuery = useClients(deferredQuery);
  const { data: metricsData } = useCustomerMetrics();
  const selectedCustomerQuery = useClient(selectedCustomerId ?? '');
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  useEffect(() => {
    const customerIdFromQuery = searchParams.get('customer');

    if (!customerIdFromQuery) {
      return;
    }

    setSelectedCustomerId(customerIdFromQuery);
    openDetailsForCurrentLayout();
    scrollPageToTop();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('customer');
    setSearchParams(nextParams, { replace: true });
  }, [openDetailsForCurrentLayout, searchParams, setSearchParams]);

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

    closeMobileDetails();
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
      closeMobileDetails();
      toast.success('Klient zostal usuniety');
    } catch {
      toast.error(
        'Nie mozna usunac klienta, poniewaz prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  function handleSelectCustomer(id: string) {
    setSelectedCustomerId(id);
    openDetailsForCurrentLayout();
    scrollPageToTop();
  }

  function closeCustomerDetails() {
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    setSelectedCustomerId(null);
    closeMobileDetails();
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

      <MasterDetailLayout
        showDetails={shouldShowCustomerDetails}
        list={
          isListLoading ? (
            <ListSkeleton />
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
          )
        }
        details={
          <CustomerDetails
            customer={selectedCustomer}
            isLoading={isInitialLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeCustomerDetails}
          />
        }
      />

      <MobileDetailSheet
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
        eyebrow="Szczegoly klienta"
        title={selectedCustomer?.full_name ?? 'Wybrany klient'}
        closeLabel="Zamknij szczegoly klienta"
      >
        <CustomerDetails
          customer={selectedCustomer}
          isLoading={isInitialLoading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          variant="sheet"
        />
      </MobileDetailSheet>

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
