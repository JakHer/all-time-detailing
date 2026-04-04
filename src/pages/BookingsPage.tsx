import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookingDetails } from '../components/bookings/BookingDetails';
import { BookingList } from '../components/bookings/BookingList';
import { BookingModal } from '../components/bookings/BookingModal';
import { BookingToolbar } from '../components/bookings/BookingToolbar';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  bookingStatuses,
  type Booking,
  type BookingStatus,
} from '../data/bookings';
import {
  createBooking,
  deleteBooking,
  fetchBookingFormOptions,
  fetchBookings,
  restoreBooking,
  updateBooking,
  updateBookingStatus,
  type BookingFormOptions,
} from '../lib/bookings';

const allStatuses: Array<BookingStatus | 'Wszystkie'> = [
  'Wszystkie',
  ...bookingStatuses,
];
const bookingsQueryKey = ['bookings'] as const;
const bookingFormOptionsQueryKey = ['booking-form-options'] as const;
const emptyBookings: Booking[] = [];
const emptyBookingFormOptions: BookingFormOptions = {
  clients: [],
  vehicles: [],
  services: [],
};

type ModalMode = 'create' | 'edit' | null;
type NewBookingPayload = Omit<Booking, 'id'>;
type SaveBookingResult = {
  booking: Booking;
  mode: 'create' | 'edit';
};
type BookingMutationVariables = {
  bookingId: string;
};
type RestoreStatusVariables = {
  bookingId: string;
  status: BookingStatus;
};

function reportBookingError(error: unknown) {
  if (import.meta.env.DEV) {
    window.dispatchEvent(new CustomEvent('booking-error', { detail: error }));
  }
}

export function BookingsPage() {
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'Wszystkie'>(
    'Wszystkie',
  );
  const [query, setQuery] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const bookingsQuery = useQuery({
    queryKey: bookingsQueryKey,
    queryFn: fetchBookings,
  });

  const bookingFormOptionsQuery = useQuery({
    queryKey: bookingFormOptionsQueryKey,
    queryFn: fetchBookingFormOptions,
  });

  const bookings = bookingsQuery.data ?? emptyBookings;
  const bookingFormOptions =
    bookingFormOptionsQuery.data ?? emptyBookingFormOptions;
  const isLoading =
    bookingsQuery.isLoading || bookingFormOptionsQuery.isLoading;

  useEffect(() => {
    if (bookingsQuery.error) {
      reportBookingError(bookingsQuery.error);
      toast.error('Nie uda\u0142o si\u0119 pobra\u0107 danych rezerwacji', {
        description:
          'Sprawd\u017a po\u0142\u0105czenie z Supabase i czy schema SQL zosta\u0142a uruchomiona poprawnie.',
      });
    }
  }, [bookingsQuery.error]);

  useEffect(() => {
    if (bookingFormOptionsQuery.error) {
      reportBookingError(bookingFormOptionsQuery.error);
      toast.error('Nie uda\u0142o si\u0119 pobra\u0107 danych formularza', {
        description:
          'Lista klient\u00f3w, pojazd\u00f3w lub us\u0142ug nie mog\u0142a zosta\u0107 wczytana z Supabase.',
      });
    }
  }, [bookingFormOptionsQuery.error]);

  useEffect(() => {
    setSelectedBookingId((current) => {
      if (current && bookings.some((booking) => booking.id === current)) {
        return current;
      }

      return bookings[0]?.id ?? null;
    });
  }, [bookings]);

  const saveBookingMutation = useMutation<
    SaveBookingResult,
    Error,
    Booking | NewBookingPayload
  >({
    mutationFn: async (payload) => {
      if ('id' in payload) {
        return {
          booking: await updateBooking(payload),
          mode: 'edit' as const,
        };
      }

      return {
        booking: await createBooking(payload),
        mode: 'create' as const,
      };
    },
    onSuccess: async ({ booking, mode }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingsQueryKey }),
        queryClient.invalidateQueries({ queryKey: bookingFormOptionsQueryKey }),
      ]);

      setSelectedBookingId(booking.id);
      setModalMode(null);

      if (mode === 'edit') {
        toast.success('Wizyta zaktualizowana', {
          description: `${booking.vehicle} zosta\u0142a zapisana z nowymi danymi.`,
        });
        return;
      }

      setStatusFilter('Wszystkie');
      setQuery('');
      toast.success('Dodano rezerwacj\u0119', {
        description: `${booking.vehicle} zosta\u0142a dodana do planu dnia.`,
      });
    },
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie uda\u0142o si\u0119 zapisa\u0107 rezerwacji', {
        description:
          'Sprawd\u017a po\u0142\u0105czenie z Supabase i struktur\u0119 tabel.',
      });
    },
  });

  const cancelBookingMutation = useMutation<
    Booking,
    Error,
    BookingMutationVariables
  >({
    mutationFn: ({ bookingId }) => updateBookingStatus(bookingId, 'Anulowana'),
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie uda\u0142o si\u0119 anulowa\u0107 wizyty');
    },
  });

  const restoreStatusMutation = useMutation<
    Booking,
    Error,
    RestoreStatusVariables
  >({
    mutationFn: ({ bookingId, status }) =>
      updateBookingStatus(bookingId, status),
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie uda\u0142o si\u0119 cofn\u0105\u0107 anulowania');
    },
  });

  const deleteBookingMutation = useMutation<
    void,
    Error,
    BookingMutationVariables
  >({
    mutationFn: ({ bookingId }) => deleteBooking(bookingId),
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie uda\u0142o si\u0119 usun\u0105\u0107 wizyty');
    },
  });

  const restoreBookingMutation = useMutation<Booking, Error, Booking>({
    mutationFn: (booking) => restoreBooking(booking),
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie uda\u0142o si\u0119 przywr\u00f3ci\u0107 wizyty');
    },
  });

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === 'Wszystkie' || booking.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      booking.client.toLowerCase().includes(normalizedQuery) ||
      booking.vehicle.toLowerCase().includes(normalizedQuery) ||
      booking.service.toLowerCase().includes(normalizedQuery) ||
      booking.licensePlate.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const selectedBooking =
    filteredBookings.find((booking) => booking.id === selectedBookingId) ??
    bookings.find((booking) => booking.id === selectedBookingId) ??
    filteredBookings[0] ??
    null;

  const metrics = [
    { label: 'Dzisiaj', value: `${bookings.length} wizyt` },
    {
      label: 'Potwierdzone',
      value: `${bookings.filter((booking) => booking.status === 'Potwierdzona').length}`,
    },
    {
      label: 'W realizacji',
      value: `${bookings.filter((booking) => booking.status === 'W realizacji').length}`,
    },
    {
      label: 'Do kontaktu',
      value: `${bookings.filter((booking) => booking.status === 'Nowa').length}`,
    },
  ];

  function handleSaveBooking(payload: Booking | NewBookingPayload) {
    saveBookingMutation.mutate(payload);
  }

  function handleCancelBooking() {
    if (!selectedBooking || selectedBooking.status === 'Anulowana') {
      return;
    }

    const previousBooking = selectedBooking;

    cancelBookingMutation.mutate(
      { bookingId: selectedBooking.id },
      {
        onSuccess: async (updatedBooking) => {
          await queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
          setSelectedBookingId(updatedBooking.id);
          toast.warning('Wizyta anulowana', {
            description: `${updatedBooking.vehicle} zosta\u0142a oznaczona jako anulowana.`,
            action: {
              label: 'Cofnij',
              onClick: () => {
                restoreStatusMutation.mutate(
                  {
                    bookingId: previousBooking.id,
                    status: previousBooking.status,
                  },
                  {
                    onSuccess: async (restoredBooking) => {
                      await queryClient.invalidateQueries({
                        queryKey: bookingsQueryKey,
                      });
                      setSelectedBookingId(restoredBooking.id);
                    },
                  },
                );
              },
            },
          });
        },
      },
    );
  }

  function openDeleteConfirm() {
    if (!selectedBooking) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  }

  function closeDeleteConfirm() {
    setIsDeleteConfirmOpen(false);
  }

  function handleDeleteBooking() {
    if (!selectedBooking) {
      return;
    }

    const bookingToDelete = selectedBooking;
    const remainingBookings = bookings.filter(
      (booking) => booking.id !== bookingToDelete.id,
    );
    const nextSelectedBookingId = remainingBookings[0]?.id ?? null;

    deleteBookingMutation.mutate(
      { bookingId: bookingToDelete.id },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
          setSelectedBookingId(nextSelectedBookingId);
          setModalMode(null);
          setIsDeleteConfirmOpen(false);
          toast.error('Wizyta usuni\u0119ta', {
            description: `${bookingToDelete.vehicle} zosta\u0142a usuni\u0119ta z harmonogramu.`,
            action: {
              label: 'Cofnij',
              onClick: () => {
                restoreBookingMutation.mutate(bookingToDelete, {
                  onSuccess: async (restoredBooking) => {
                    await Promise.all([
                      queryClient.invalidateQueries({
                        queryKey: bookingsQueryKey,
                      }),
                      queryClient.invalidateQueries({
                        queryKey: bookingFormOptionsQueryKey,
                      }),
                    ]);
                    setSelectedBookingId(restoredBooking.id);
                  },
                });
              },
            },
          });
        },
      },
    );
  }

  function handleStatusFilterChange(value: BookingStatus | 'Wszystkie') {
    setStatusFilter(value);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function openCreateModal() {
    setModalMode('create');
  }

  function openEditModal() {
    if (!selectedBooking) {
      return;
    }

    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
  }

  return (
    <>
      <PageIntro
        eyebrow="Rezerwacje"
        title="Kalendarz, który naprawdę porządkuje dzień studia"
        description="To jest pierwszy działający moduł recepcji: filtrujesz wizyty, przeglądasz szczegóły i dodajesz nowe rezerwacje bez wychodzenia z jednego widoku."
        metrics={metrics}
      />

      <BookingToolbar
        query={query}
        onQueryChange={handleQueryChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statuses={allStatuses}
        onCreateClick={openCreateModal}
      />

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <BookingList
          bookings={filteredBookings}
          selectedBookingId={selectedBooking?.id ?? null}
          onSelect={setSelectedBookingId}
        />

        <div className="grid gap-4">
          {isLoading ? (
            <article className="rounded-4xl border border-white/10 bg-white/6 p-6 text-sm text-stone-300 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
              Ładuję rezerwacje z Supabase...
            </article>
          ) : null}

          <BookingDetails
            booking={selectedBooking ?? undefined}
            onEditClick={openEditModal}
            onCancelClick={handleCancelBooking}
            onDeleteClick={openDeleteConfirm}
          />
        </div>
      </section>

      {modalMode ? (
        <BookingModal
          mode={modalMode}
          booking={
            modalMode === 'edit' ? (selectedBooking ?? undefined) : undefined
          }
          clients={bookingFormOptions.clients}
          vehicles={bookingFormOptions.vehicles}
          services={bookingFormOptions.services}
          onClose={closeModal}
          onSave={handleSaveBooking}
        />
      ) : null}

      {isDeleteConfirmOpen && selectedBooking ? (
        <ConfirmDialog
          title="Usunąć tę wizytę?"
          description={`Ta akcja usunie z harmonogramu wizytę dla ${selectedBooking.vehicle}. Nadal będzie można ją cofnąć z toastu przez krótki moment.`}
          confirmLabel="Usuń wizytę"
          tone="danger"
          onCancel={closeDeleteConfirm}
          onConfirm={handleDeleteBooking}
        />
      ) : null}
    </>
  );
}
