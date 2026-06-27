import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageIntro } from '../components/common/PageIntro';
import { ServiceDetails } from '../components/services/ServiceDetails';
import { ServiceList } from '../components/services/ServiceList';
import { ServiceModal } from '../components/services/ServiceModal';
import { ServiceToolbar } from '../components/services/ServiceToolbar';
import { ConfirmDialog } from '../components/primitives/ConfirmDialog';
import { ListSkeleton } from '../components/entity/ListSkeleton';
import { MasterDetailLayout } from '../components/layout/MasterDetailLayout';
import { MobileDetailSheet } from '../components/layout/MobileDetailSheet';
import { MobilePageHeader } from '../components/common/MobilePageHeader';
import { useResponsiveDetailsPanel } from '../components/layout/useResponsiveDetailsPanel';
import { scrollPageToTop } from '../lib/scroll';
import {
  useCreateService,
  useDeleteService,
  useService,
  useServiceMetrics,
  useServices,
  useUpdateService,
  type NewService,
} from '../lib/services';

export function ServicesPage() {
  const {
    isDesktopDetailsLayout,
    isMobileDetailsOpen,
    setIsMobileDetailsOpen,
    openDetailsForCurrentLayout,
    closeMobileDetails,
  } = useResponsiveDetailsPanel();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const servicesQuery = useServices(deferredQuery);
  const { data: metricsData } = useServiceMetrics();
  const selectedServiceQuery = useService(selectedServiceId ?? '');
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const services =
    servicesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalServices = servicesQuery.data?.pages[0]?.totalCount ?? 0;
  const selectedService = selectedServiceQuery.data ?? null;
  const isListLoading = servicesQuery.isLoading;
  const isDetailsLoading =
    servicesQuery.isLoading ||
    (selectedServiceId !== null && selectedServiceQuery.isLoading);

  const metrics = useMemo(
    () => [
      {
        label: 'Wszystkie uslugi',
        value: String(metricsData?.totalServices ?? totalServices),
      },
      {
        label: 'Aktywne',
        value: String(metricsData?.activeServices ?? 0),
      },
      {
        label: 'Sr. cena',
        value: formatCurrency(metricsData?.averagePrice ?? 0),
      },
    ],
    [metricsData, totalServices],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedServiceId) {
      return;
    }

    closeMobileDetails();
    setModalMode('edit');
    setIsModalOpen(true);
  }

  function handleDeleteClick() {
    if (!selectedServiceId) {
      return;
    }

    setIsDeleteDialogOpen(true);
  }

  async function handleModalSubmit(data: NewService) {
    try {
      if (modalMode === 'edit' && selectedServiceId) {
        await updateMutation.mutateAsync({ ...data, id: selectedServiceId });
        toast.success('Usluga zostala zaktualizowana');
      } else {
        const newService = await createMutation.mutateAsync(data);
        setSelectedServiceId(newService.id);
        toast.success('Nowa usluga zostala dodana');
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Wystapil blad podczas zapisywania uslugi');
    }
  }

  async function confirmDelete() {
    if (!selectedServiceId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedServiceId);
      setSelectedServiceId(null);
      setIsDeleteDialogOpen(false);
      closeMobileDetails();
      toast.success('Usluga zostala usunieta');
    } catch {
      toast.error(
        'Nie mozna usunac uslugi, poniewaz prawdopodobnie jest powiazana z rezerwacjami.',
      );
    }
  }

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    openDetailsForCurrentLayout();
    scrollPageToTop();
  }

  function closeServiceDetails() {
    setSelectedServiceId(null);
    closeMobileDetails();
  }

  const shouldShowServiceDetails = selectedServiceId !== null;

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="Uslugi"
          title="Pakiety, cennik i standardy realizacji"
          metrics={metrics}
        />
      </div>

      <MobilePageHeader
        eyebrow="Uslugi"
        title="Oferta studia"
        chips={[
          `${metricsData?.totalServices ?? totalServices} uslug`,
          `${metricsData?.activeServices ?? 0} aktywne`,
        ]}
      />

      <ServiceToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <MasterDetailLayout
        showDetails={shouldShowServiceDetails}
        list={
          isListLoading ? (
            <ListSkeleton />
          ) : (
            <ServiceList
              services={services}
              selectedServiceId={selectedServiceId}
              onSelect={handleSelectService}
              totalCount={totalServices}
              hasNextPage={servicesQuery.hasNextPage ?? false}
              isFetchingNextPage={servicesQuery.isFetchingNextPage}
              onLoadMore={() => {
                void servicesQuery.fetchNextPage();
              }}
            />
          )
        }
        details={
          <ServiceDetails
            service={selectedService}
            isLoading={isDetailsLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeServiceDetails}
          />
        }
      />

      <MobileDetailSheet
        open={
          !isDesktopDetailsLayout && isMobileDetailsOpen && !!selectedServiceId
        }
        onOpenChange={setIsMobileDetailsOpen}
        eyebrow="Szczegoly uslugi"
        title={selectedService?.name ?? 'Wybrana usluga'}
        closeLabel="Zamknij szczegoly uslugi"
      >
        <ServiceDetails
          service={selectedService}
          isLoading={isDetailsLoading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          variant="sheet"
        />
      </MobileDetailSheet>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalMode === 'edit' ? selectedService : null}
        title={modalMode === 'edit' ? 'Edytuj usluge' : 'Dodaj nowa usluge'}
      />

      {isDeleteDialogOpen ? (
        <ConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
          title="Usun usluge"
          description={`Czy na pewno chcesz usunac usluge ${selectedService?.name}? Tej operacji nie mozna cofnac.`}
          confirmLabel="Usun usluge"
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
