import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageIntro } from '../components/common/PageIntro';
import { VehicleDetails } from '../components/vehicles/VehicleDetails';
import { VehicleList } from '../components/vehicles/VehicleList';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import { VehicleToolbar } from '../components/vehicles/VehicleToolbar';
import { ConfirmDialog } from '../components/primitives/ConfirmDialog';
import { ListSkeleton } from '../components/entity/ListSkeleton';
import { MasterDetailLayout } from '../components/layout/MasterDetailLayout';
import { MobileDetailSheet } from '../components/layout/MobileDetailSheet';
import { MobilePageHeader } from '../components/common/MobilePageHeader';
import { useResponsiveDetailsPanel } from '../components/layout/useResponsiveDetailsPanel';
import { useClientOptions } from '../lib/clients';
import { scrollPageToTop } from '../lib/scroll';
import {
  useVehicle,
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicleMetrics,
  useVehicles,
  type NewVehicle,
} from '../lib/vehicles';

export function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isDesktopDetailsLayout,
    isMobileDetailsOpen,
    setIsMobileDetailsOpen,
    openDetailsForCurrentLayout,
    closeMobileDetails,
  } = useResponsiveDetailsPanel();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const vehiclesQuery = useVehicles(deferredQuery);
  const { data: clients = [] } = useClientOptions();
  const { data: metricsData } = useVehicleMetrics();
  const selectedVehicleQuery = useVehicle(selectedVehicleId ?? '');
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  useEffect(() => {
    const vehicleIdFromQuery = searchParams.get('vehicle');

    if (!vehicleIdFromQuery) {
      return;
    }

    setSelectedVehicleId(vehicleIdFromQuery);
    openDetailsForCurrentLayout();
    scrollPageToTop();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('vehicle');
    setSearchParams(nextParams, { replace: true });
  }, [openDetailsForCurrentLayout, searchParams, setSearchParams]);

  const vehicles =
    vehiclesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalVehicles = vehiclesQuery.data?.pages[0]?.totalCount ?? 0;
  const selectedVehicle = selectedVehicleQuery.data ?? null;
  const isListLoading = vehiclesQuery.isLoading;
  const isDetailsLoading =
    vehiclesQuery.isLoading ||
    (selectedVehicleId !== null && selectedVehicleQuery.isLoading);

  const metrics = useMemo(
    () => [
      {
        label: 'Pojazdy w bazie',
        value: String(metricsData?.totalVehicles ?? totalVehicles),
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
    [metricsData, totalVehicles],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedVehicleId) {
      return;
    }

    closeMobileDetails();
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
      closeMobileDetails();
      toast.success('Pojazd został usunięty');
    } catch {
      toast.error(
        'Nie można usunąć pojazdu, ponieważ prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  function handleSelectVehicle(id: string) {
    setSelectedVehicleId(id);
    openDetailsForCurrentLayout();
    scrollPageToTop();
  }

  function closeVehicleDetails() {
    setSelectedVehicleId(null);
    closeMobileDetails();
  }

  const shouldShowVehicleDetails = selectedVehicleId !== null;

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <div className="hidden sm:block">
        <PageIntro eyebrow="Pojazdy" title="Kartoteka aut" metrics={metrics} />
      </div>

      <MobilePageHeader
        eyebrow="Pojazdy"
        title="Baza pojazdow"
        chips={[
          `${metricsData?.totalVehicles ?? totalVehicles} aut`,
          `${metricsData?.uniqueMakes ?? 0} marek`,
        ]}
      />

      <VehicleToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <MasterDetailLayout
        showDetails={shouldShowVehicleDetails}
        list={
          isListLoading ? (
            <ListSkeleton />
          ) : (
            <VehicleList
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelect={handleSelectVehicle}
              totalCount={totalVehicles}
              hasNextPage={vehiclesQuery.hasNextPage ?? false}
              isFetchingNextPage={vehiclesQuery.isFetchingNextPage}
              onLoadMore={() => {
                void vehiclesQuery.fetchNextPage();
              }}
            />
          )
        }
        details={
          <VehicleDetails
            vehicle={selectedVehicle}
            isLoading={isDetailsLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeVehicleDetails}
          />
        }
      />

      <MobileDetailSheet
        open={
          !isDesktopDetailsLayout && isMobileDetailsOpen && !!selectedVehicleId
        }
        onOpenChange={setIsMobileDetailsOpen}
        eyebrow="Szczegoly pojazdu"
        title={
          selectedVehicle
            ? `${selectedVehicle.make} ${selectedVehicle.model}`
            : 'Wybrany pojazd'
        }
        closeLabel="Zamknij szczegoly pojazdu"
      >
        <VehicleDetails
          vehicle={selectedVehicle}
          isLoading={isDetailsLoading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          variant="sheet"
        />
      </MobileDetailSheet>

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
