import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerModal } from '../components/customers/CustomerModal';
import { CustomerToolbar } from '../components/customers/CustomerToolbar';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import {
  useClients,
  useCreateClient,
  useCustomerMetrics,
  useDeleteClient,
  useUpdateClient,
  type ClientWithRelations,
  type NewClient,
} from '../lib/clients';

export function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const { data: clients = [], isLoading } = useClients();
  const { data: metricsData } = useCustomerMetrics();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const selectedCustomer =
    clients.find((client) => client.id === selectedCustomerId) ?? null;

  const filteredClients = clients.filter((client) => {
    const searchValue = deferredQuery.toLowerCase();

    return (
      client.full_name.toLowerCase().includes(searchValue) ||
      client.phone.includes(searchValue) ||
      client.email?.toLowerCase().includes(searchValue)
    );
  });

  const metrics = useMemo(
    () => [
      {
        label: 'Aktywni klienci',
        value: String(metricsData?.totalClients ?? clients.length),
      },
      {
        label: 'Nowi (30 dni)',
        value: String(metricsData?.newClientsLast30Days ?? 0),
      },
      {
        label: 'Powracający',
        value: `${Math.round(metricsData?.returningRate ?? 0)}%`,
      },
      {
        label: 'Śr. wartość',
        value: formatCurrency(metricsData?.averageBookingValue ?? 0),
      },
    ],
    [clients.length, metricsData],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedCustomerId) {
      return;
    }

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
        toast.success('Dane klienta zostały zaktualizowane');
      } else {
        const newClient = await createMutation.mutateAsync(data);
        setSelectedCustomerId(newClient.id);
        toast.success('Nowy klient został dodany');
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Wystąpił błąd podczas zapisywania klienta');
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
      toast.success('Klient został usunięty');
    } catch {
      toast.error(
        'Nie można usunąć klienta, ponieważ prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <PageIntro
        eyebrow="Klienci"
        title="Baza klientów z historią wizyt i wartością relacji"
        description="Zarządzaj swoją bazą klientów, przeglądaj ich historię wizyt oraz przypisane pojazdy w jednym miejscu."
        metrics={metrics}
      />

      <CustomerToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section
        className="grid min-h-180 min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start"
        style={{ overflowAnchor: 'none' }}
      >
        <div className="min-w-0 max-w-full">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <CustomerList
              customers={filteredClients}
              selectedCustomerId={selectedCustomerId}
              onSelect={setSelectedCustomerId}
            />
          )}
        </div>

        <div className="min-w-0 max-w-full" style={{ overflowAnchor: 'none' }}>
          <CustomerDetails
            customer={selectedCustomer}
            isLoading={isLoading && clients.length === 0}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </section>

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
          title="Usuń klienta"
          description={`Czy na pewno chcesz usunąć klienta ${selectedCustomer?.full_name}? Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń klienta"
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
  }).format(value)} zł`;
}
