import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageIntro } from '../components/PageIntro';
import { VehicleDetails } from '../components/vehicles/VehicleDetails';
import { VehicleList } from '../components/vehicles/VehicleList';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import { VehicleToolbar } from '../components/vehicles/VehicleToolbar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { useClients } from '../lib/clients';
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicleMetrics,
  useVehicles,
  type NewVehicle,
} from '../lib/vehicles';

export function VehiclesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const { data: vehicles = [], isLoading } = useVehicles();
  const { data: clients = [] } = useClients();
  const { data: metricsData } = useVehicleMetrics();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const filteredVehicles = useMemo(() => {
    const searchValue = deferredQuery.toLowerCase().trim();

    if (!searchValue) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const haystack = [
        vehicle.make,
        vehicle.model,
        vehicle.registration,
        vehicle.color,
        vehicle.clients.full_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchValue);
    });
  }, [deferredQuery, vehicles]);

  const selectedVehicle =
    filteredVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ??
    vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ??
    null;

  const metrics = useMemo(
    () => [
      {
        label: 'Pojazdy w bazie',
        value: String(metricsData?.totalVehicles ?? vehicles.length),
      },
      {
        label: 'Nowe (30 dni)',
        value: String(metricsData?.newVehiclesLast30Days ?? 0),
      },
      {
        label: 'Z historią wizyt',
        value: String(metricsData?.vehiclesWithHistory ?? 0),
      },
      {
        label: 'Marki w bazie',
        value: String(metricsData?.uniqueMakes ?? 0),
      },
    ],
    [metricsData, vehicles.length],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedVehicleId) {
      return;
    }

    setModalMode('edit');
    setIsModalOpen(true);
  }

  function handleDeleteClick() {
    if (!selectedVehicleId) {
      return;
    }

    setIsDeleteDialogOpen(true);
  }

  async function handleModalSubmit(data: NewVehicle) {
    try {
      if (modalMode === 'edit' && selectedVehicleId) {
        await updateMutation.mutateAsync({ ...data, id: selectedVehicleId });
        toast.success('Dane pojazdu zostały zaktualizowane');
      } else {
        const newVehicle = await createMutation.mutateAsync(data);
        setSelectedVehicleId(newVehicle.id);
        toast.success('Nowy pojazd został dodany');
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Wystąpił błąd podczas zapisywania pojazdu');
    }
  }

  async function confirmDelete() {
    if (!selectedVehicleId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedVehicleId);
      setSelectedVehicleId(null);
      setIsDeleteDialogOpen(false);
      toast.success('Pojazd został usunięty');
    } catch {
      toast.error(
        'Nie można usunąć pojazdu, ponieważ prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <PageIntro
        eyebrow="Pojazdy"
        title="Kartoteka aut z pełnym kontekstem właściciela i historii wizyt"
        description="Zarządzaj bazą pojazdów, przypisanymi klientami i historią realizacji bez wychodzenia z jednego widoku."
        metrics={metrics}
      />

      <VehicleToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section
        className="grid min-h-180 min-w-0 gap-6 overflow-hidden 2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start"
        style={{ overflowAnchor: 'none' }}
      >
        <div className="min-w-0 max-w-full overflow-hidden">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <VehicleList
              vehicles={filteredVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
            />
          )}
        </div>

        <div
          className="min-w-0 max-w-full overflow-hidden"
          style={{ overflowAnchor: 'none' }}
        >
          <VehicleDetails
            vehicle={selectedVehicle}
            isLoading={isLoading && vehicles.length === 0}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </section>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalMode === 'edit' ? selectedVehicle : null}
        clients={clients}
        title={modalMode === 'edit' ? 'Edytuj pojazd' : 'Dodaj nowy pojazd'}
      />

      {isDeleteDialogOpen && selectedVehicle ? (
        <ConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
          title="Usuń pojazd"
          description={`Czy na pewno chcesz usunąć pojazd ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.registration})? Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń pojazd"
          tone="danger"
        />
      ) : null}
    </div>
  );
}
