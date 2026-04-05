import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookingDetails } from '../components/bookings/BookingDetails';
import { BookingList } from '../components/bookings/BookingList';
import { BookingModal } from '../components/bookings/BookingModal';
import { BookingToolbar } from '../components/bookings/BookingToolbar';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
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

type MutationContext = {
  previousBookings?: Booking[];
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
    queryKey: [...bookingsQueryKey, normalizedQuery],
    queryFn: () => fetchBookings(normalizedQuery),
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
      toast.error('Nie udało się pobrać danych rezerwacji', {
        description:
          'Sprawdź połączenie z Supabase i czy schema SQL została uruchomiona poprawnie.',
      });
    }
  }, [bookingsQuery.error]);

  useEffect(() => {
    if (bookingFormOptionsQuery.error) {
      reportBookingError(bookingFormOptionsQuery.error);
      toast.error('Nie udało się pobrać danych formularza', {
        description:
          'Lista klientów, pojazdów lub usług nie mogła zostać wczytana z Supabase.',
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
          description: `${booking.vehicle} została zapisana z nowymi danymi.`,
        });
        return;
      }

      setStatusFilter('Wszystkie');
      setQuery('');
      toast.success('Dodano rezerwację', {
        description: `${booking.vehicle} została dodana do planu dnia.`,
      });
    },
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie udało się zapisać rezerwacji', {
        description: 'Sprawdź połączenie z Supabase i strukturę tabel.',
      });
    },
  });

  const cancelBookingMutation = useMutation<
    Booking,
    Error,
    BookingMutationVariables,
    MutationContext
  >({
    mutationFn: ({ bookingId }) => updateBookingStatus(bookingId, 'Anulowana'),
    onMutate: async ({ bookingId }) => {
      await queryClient.cancelQueries({
        queryKey: [...bookingsQueryKey, normalizedQuery],
      });
      const previousBookings = queryClient.getQueryData<Booking[]>([
        ...bookingsQueryKey,
        normalizedQuery,
      ]);

      queryClient.setQueryData<Booking[]>(
        [...bookingsQueryKey, normalizedQuery],
        (old) =>
          old?.map((b) =>
            b.id === bookingId ? { ...b, status: 'Anulowana' as const } : b,
          ),
      );

      return { previousBookings };
    },
    onError: (error, _variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(
          [...bookingsQueryKey, normalizedQuery],
          context.previousBookings,
        );
      }
      reportBookingError(error);
      toast.error('Nie udało się anulować wizyty');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });

  const restoreStatusMutation = useMutation<
    Booking,
    Error,
    RestoreStatusVariables,
    MutationContext
  >({
    mutationFn: ({ bookingId, status }) =>
      updateBookingStatus(bookingId, status),
    onMutate: async ({ bookingId, status }) => {
      await queryClient.cancelQueries({
        queryKey: [...bookingsQueryKey, normalizedQuery],
      });
      const previousBookings = queryClient.getQueryData<Booking[]>([
        ...bookingsQueryKey,
        normalizedQuery,
      ]);

      queryClient.setQueryData<Booking[]>(
        [...bookingsQueryKey, normalizedQuery],
        (old) => old?.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );

      return { previousBookings };
    },
    onError: (error, _variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(
          [...bookingsQueryKey, normalizedQuery],
          context.previousBookings,
        );
      }
      reportBookingError(error);
      toast.error('Nie udało się cofnąć anulowania');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
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
      toast.error('Nie udało się usunąć wizyty');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });

  const restoreBookingMutation = useMutation<Booking, Error, Booking>({
    mutationFn: (booking) => restoreBooking(booking),
    onSuccess: (restoredBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
      setSelectedBookingId(restoredBooking.id);
    },
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie udało się przywrócić wizyty');
    },
  });

  const filteredBookings = bookings.filter((booking) => {
    return statusFilter === 'Wszystkie' || booking.status === statusFilter;
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
        onSuccess: (updatedBooking) => {
          setSelectedBookingId(updatedBooking.id);
          toast.warning('Wizyta anulowana', {
            description: `${updatedBooking.vehicle} została oznaczona jako anulowana.`,
            action: {
              label: 'Cofnij',
              onClick: () => {
                restoreStatusMutation.mutate({
                  bookingId: previousBooking.id,
                  status: previousBooking.status,
                });
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
        onSuccess: () => {
          setSelectedBookingId(nextSelectedBookingId);
          setModalMode(null);
          setIsDeleteConfirmOpen(false);
          toast.error('Wizyta usunięta', {
            description: `${bookingToDelete.vehicle} została usunięta z harmonogramu.`,
            action: {
              label: 'Cofnij',
              onClick: () => {
                restoreBookingMutation.mutate(bookingToDelete);
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
        {isLoading && bookings.length === 0 ? (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-30 rounded-[26px]" />
            ))}
          </div>
        ) : (
          <BookingList
            bookings={filteredBookings}
            selectedBookingId={selectedBooking?.id ?? null}
            onSelect={setSelectedBookingId}
          />
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <Skeleton className="h-100 rounded-4xl" />
          ) : (
            <BookingDetails
              booking={selectedBooking ?? undefined}
              onEditClick={openEditModal}
              onCancelClick={handleCancelBooking}
              onDeleteClick={openDeleteConfirm}
            />
          )}
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
