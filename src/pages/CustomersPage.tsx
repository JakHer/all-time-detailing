import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerModal } from '../components/customers/CustomerModal';
import { CustomerToolbar } from '../components/customers/CustomerToolbar';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
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
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

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
        label: 'Powracajacy',
        value: `${Math.round(metricsData?.returningRate ?? 0)}%`,
      },
      {
        label: 'Sr. wartosc',
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
    setIsMobileDetailsOpen(true);
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="Klienci"
          title="Baza klientow z historia wizyt i wartoscia relacji"
          description="Zarzadzaj swoja baza klientow, przegladaj ich historie wizyt oraz przypisane pojazdy w jednym miejscu."
          metrics={metrics}
        />
      </div>

      <MobilePageHeader
        eyebrow="Klienci"
        title="Baza klientow"
        chips={[
          `${metricsData?.totalClients ?? clients.length} osob`,
          `${Math.round(metricsData?.returningRate ?? 0)}% powracalnosc`,
        ]}
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
              onSelect={handleSelectCustomer}
            />
          )}
        </div>

        <div
          className="hidden min-w-0 max-w-full 2xl:block"
          style={{ overflowAnchor: 'none' }}
        >
          <CustomerDetails
            customer={selectedCustomer}
            isLoading={isLoading && clients.length === 0}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </section>

      <Dialog.Root
        open={isMobileDetailsOpen && !!selectedCustomer}
        onOpenChange={setIsMobileDetailsOpen}
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
                isLoading={isLoading && clients.length === 0}
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
