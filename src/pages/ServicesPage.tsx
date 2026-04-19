import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageIntro } from '../components/PageIntro';
import { ServiceDetails } from '../components/services/ServiceDetails';
import { ServiceList } from '../components/services/ServiceList';
import { ServiceModal } from '../components/services/ServiceModal';
import { ServiceToolbar } from '../components/services/ServiceToolbar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
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
  const [isDesktopDetailsLayout, setIsDesktopDetailsLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1536px)').matches
      : false,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const { data: services = [], isLoading } = useServices();
  const { data: metricsData } = useServiceMetrics();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

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

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? null;

  const filteredServices = services.filter((service) => {
    const searchValue = deferredQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchValue) ||
      service.description?.toLowerCase().includes(searchValue)
    );
  });

  const metrics = useMemo(
    () => [
      {
        label: 'Wszystkie uslugi',
        value: String(metricsData?.totalServices ?? services.length),
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
    [services.length, metricsData],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedServiceId) {
      return;
    }

    setIsMobileDetailsOpen(false);
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
      setIsMobileDetailsOpen(false);
      toast.success('Usluga zostala usunieta');
    } catch {
      toast.error(
        'Nie mozna usunac uslugi, poniewaz prawdopodobnie jest powiazana z rezerwacjami.',
      );
    }
  }

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
  }

  function closeServiceDetails() {
    setSelectedServiceId(null);
    setIsMobileDetailsOpen(false);
  }

  const shouldShowServiceDetails = selectedService !== null;

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
          `${metricsData?.totalServices ?? services.length} uslug`,
          `${metricsData?.activeServices ?? 0} aktywne`,
        ]}
      />

      <ServiceToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section
        className={`grid min-h-180 min-w-0 gap-6 ${
          shouldShowServiceDetails
            ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
            : ''
        }`}
      >
        <div className="min-w-0 max-w-full">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <ServiceList
              services={filteredServices}
              selectedServiceId={selectedServiceId}
              onSelect={handleSelectService}
            />
          )}
        </div>

        <div
          className={`min-w-0 max-w-full ${
            shouldShowServiceDetails ? 'hidden 2xl:block' : 'hidden'
          }`}
        >
          <ServiceDetails
            service={selectedService}
            isLoading={isLoading && services.length === 0}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeServiceDetails}
          />
        </div>
      </section>

      <Dialog.Root
        open={
          !isDesktopDetailsLayout && isMobileDetailsOpen && !!selectedService
        }
        onOpenChange={setIsMobileDetailsOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm 2xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-70 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none 2xl:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Szczegoly uslugi
                </p>
                <p className="mt-1 truncate text-sm text-stone-400">
                  {selectedService?.name ?? 'Wybrana usluga'}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                  aria-label="Zamknij szczegoly uslugi"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <ServiceDetails
                service={selectedService}
                isLoading={isLoading && services.length === 0}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                variant="sheet"
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
