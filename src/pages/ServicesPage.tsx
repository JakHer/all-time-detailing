import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageIntro } from '../components/PageIntro';
import { ServiceDetails } from '../components/services/ServiceDetails';
import { ServiceList } from '../components/services/ServiceList';
import { ServiceModal } from '../components/services/ServiceModal';
import { ServiceToolbar } from '../components/services/ServiceToolbar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import {
  useCreateService,
  useDeleteService,
  useServiceMetrics,
  useServices,
  useUpdateService,
  type NewService,
} from '../lib/services';

export function ServicesPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const { data: services = [], isLoading } = useServices();
  const { data: metricsData } = useServiceMetrics();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? null;

  const filteredServices = services.filter((s) => {
    const searchValue = deferredQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchValue) ||
      s.description?.toLowerCase().includes(searchValue)
    );
  });

  const metrics = useMemo(
    () => [
      {
        label: 'Wszystkie usługi',
        value: String(metricsData?.totalServices ?? services.length),
      },
      {
        label: 'Aktywne',
        value: String(metricsData?.activeServices ?? 0),
      },
      {
        label: 'Śr. cena',
        value: formatCurrency(metricsData?.averagePrice ?? 0),
      },
      {
        label: 'Najczęstszy wybór',
        value: 'Premium interior', // Hardcoded for now, can be dynamic later
      },
    ],
    [services.length, metricsData],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedServiceId) return;
    setModalMode('edit');
    setIsModalOpen(true);
  }

  function handleDeleteClick() {
    if (!selectedServiceId) return;
    setIsDeleteDialogOpen(true);
  }

  async function handleModalSubmit(data: NewService) {
    try {
      if (modalMode === 'edit' && selectedServiceId) {
        await updateMutation.mutateAsync({ ...data, id: selectedServiceId });
        toast.success('Usługa została zaktualizowana');
      } else {
        const newService = await createMutation.mutateAsync(data);
        setSelectedServiceId(newService.id);
        toast.success('Nowa usługa została dodana');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Wystąpił błąd podczas zapisywania usługi');
    }
  }

  async function confirmDelete() {
    if (!selectedServiceId) return;

    try {
      await deleteMutation.mutateAsync(selectedServiceId);
      setSelectedServiceId(null);
      setIsDeleteDialogOpen(false);
      toast.success('Usługa została usunięta');
    } catch {
      toast.error(
        'Nie można usunąć usługi, ponieważ prawdopodobnie jest powiązana z rezerwacjami.',
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <PageIntro
        eyebrow="Usługi"
        title="Pakiety, cennik i standardy realizacji"
        description="Zarządzaj ofertą usług, pakietami i dodatkami, tak aby recepcja mogła szybko składać spójne wyceny."
        metrics={metrics}
      />

      <ServiceToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section className="grid min-h-180 min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start">
        <div className="min-w-0 max-w-full">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <ServiceList
              services={filteredServices}
              selectedServiceId={selectedServiceId}
              onSelect={setSelectedServiceId}
            />
          )}
        </div>

        <div className="min-w-0 max-w-full">
          <ServiceDetails
            service={selectedService}
            isLoading={isLoading && services.length === 0}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </section>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalMode === 'edit' ? selectedService : null}
        title={modalMode === 'edit' ? 'Edytuj usługę' : 'Dodaj nową usługę'}
      />

      {isDeleteDialogOpen ? (
        <ConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
          title="Usuń usługę"
          description={`Czy na pewno chcesz usunąć usługę ${selectedService?.name}? Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń usługę"
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
