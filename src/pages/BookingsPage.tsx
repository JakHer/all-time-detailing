import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookingDetails } from '../components/bookings/BookingDetails';
import { BookingList } from '../components/bookings/BookingList';
import { BookingModal } from '../components/bookings/BookingModal';
import {
  BookingToolbar,
  type BookingCalendarView,
} from '../components/bookings/BookingToolbar';
import { BookingMonthView } from '../components/bookings/BookingMonthView';
import { BookingWeekView } from '../components/bookings/BookingWeekView';
import { PageIntro } from '../components/PageIntro';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { type Booking, type BookingStatus } from '../data/bookings';
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
import {
  formatMonthLabel,
  formatWeekdayLabel,
  getTodayDateString,
  getWeekDateStrings,
  isSameMonth,
  shiftDateByDays,
  shiftDateByMonths,
} from '../lib/dateUtils';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const today = getTodayDateString();
  const [isDesktopDetailsLayout, setIsDesktopDetailsLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1536px)').matches
      : false,
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [calendarView, setCalendarView] = useState<BookingCalendarView>('day');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

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

  useEffect(() => {
    if (searchParams.get('nowa') === '1' && bookingFormOptionsQuery.isSuccess) {
      setModalMode('create');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('nowa');
      setSearchParams(nextParams, { replace: true });
    }
  }, [bookingFormOptionsQuery.isSuccess, searchParams, setSearchParams]);

  useEffect(() => {
    const bookingIdFromQuery = searchParams.get('booking');
    const dateFromQuery = searchParams.get('date');

    if (!bookingIdFromQuery || bookingsQuery.isLoading) {
      return;
    }

    const bookingFromQuery = bookings.find(
      (booking) => booking.id === bookingIdFromQuery,
    );

    if (!bookingFromQuery) {
      if (bookingsQuery.isSuccess) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('booking');
        nextParams.delete('date');
        setSearchParams(nextParams, { replace: true });
      }
      return;
    }

    setCalendarView('day');
    setSelectedDate(dateFromQuery || bookingFromQuery.date);
    setSelectedBookingId(bookingFromQuery.id);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
    scrollBookingsPageToTop();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('booking');
    nextParams.delete('date');
    setSearchParams(nextParams, { replace: true });
  }, [
    bookings,
    bookingsQuery.isLoading,
    bookingsQuery.isSuccess,
    isDesktopDetailsLayout,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (bookingsQuery.error) {
      reportBookingError(bookingsQuery.error);
      toast.error('Nie udalo sie pobrac danych rezerwacji', {
        description:
          'Sprawdz polaczenie z Supabase i czy schema SQL zostala uruchomiona poprawnie.',
      });
    }
  }, [bookingsQuery.error]);

  useEffect(() => {
    if (bookingFormOptionsQuery.error) {
      reportBookingError(bookingFormOptionsQuery.error);
      toast.error('Nie udalo sie pobrac danych formularza', {
        description:
          'Lista klientow, pojazdow lub uslug nie mogla zostac wczytana z Supabase.',
      });
    }
  }, [bookingFormOptionsQuery.error]);

  const visibleBookings = useMemo(() => {
    if (calendarView === 'week') {
      const weekDates = new Set(getWeekDateStrings(selectedDate));
      return bookings.filter((booking) => weekDates.has(booking.date));
    }

    if (calendarView === 'month') {
      return bookings.filter((booking) =>
        isSameMonth(booking.date, selectedDate),
      );
    }

    return bookings.filter((booking) => booking.date === selectedDate);
  }, [bookings, calendarView, selectedDate]);

  useEffect(() => {
    setSelectedBookingId((current) => {
      if (
        current &&
        visibleBookings.some((booking) => booking.id === current)
      ) {
        return current;
      }

      return null;
    });
  }, [visibleBookings]);

  useEffect(() => {
    if (calendarView !== 'day') {
      setIsMobileDetailsOpen(false);
    }
  }, [calendarView]);

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

      setSelectedDate(booking.date);
      setSelectedBookingId(booking.id);
      setCalendarView('day');
      setModalMode(null);

      if (mode === 'edit') {
        toast.success('Wizyta zaktualizowana', {
          description: `${booking.vehicle} zostala zapisana z nowymi danymi.`,
        });
        return;
      }

      setQuery('');
      toast.success('Dodano rezerwacje', {
        description: `${booking.vehicle} zostala dodana do harmonogramu.`,
      });
    },
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie udalo sie zapisac rezerwacji', {
        description: 'Sprawdz polaczenie z Supabase i strukture tabel.',
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
          old?.map((item) =>
            item.id === bookingId
              ? { ...item, status: 'Anulowana' as const }
              : item,
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
      toast.error('Nie udalo sie anulowac wizyty');
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
        (old) =>
          old?.map((item) =>
            item.id === bookingId ? { ...item, status } : item,
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
      toast.error('Nie udalo sie cofnac anulowania');
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
      toast.error('Nie udalo sie usunac wizyty');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });

  const restoreBookingMutation = useMutation<Booking, Error, Booking>({
    mutationFn: (booking) => restoreBooking(booking),
    onSuccess: (restoredBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
      setSelectedDate(restoredBooking.date);
      setSelectedBookingId(restoredBooking.id);
      setCalendarView('day');
    },
    onError: (error) => {
      reportBookingError(error);
      toast.error('Nie udalo sie przywrocic wizyty');
    },
  });

  const selectedBooking =
    visibleBookings.find((booking) => booking.id === selectedBookingId) ?? null;

  const selectedRangeLabel = useMemo(() => {
    if (calendarView === 'week') {
      const weekDates = getWeekDateStrings(selectedDate);
      return `${formatWeekdayLabel(weekDates[0], {
        day: '2-digit',
        month: 'short',
      })} - ${formatWeekdayLabel(weekDates[6], {
        day: '2-digit',
        month: 'short',
      })}`;
    }

    if (calendarView === 'month') {
      return formatMonthLabel(selectedDate);
    }

    return formatSelectedDate(selectedDate, today);
  }, [calendarView, selectedDate, today]);

  const rangeLabelEyebrow =
    calendarView === 'week'
      ? 'Wybrany tydzien'
      : calendarView === 'month'
        ? 'Wybrany miesiac'
        : 'Wybrany dzien';
  const shouldShowBookingDetails =
    calendarView === 'day' && selectedBooking !== null;

  const metrics = [
    {
      label:
        calendarView === 'month'
          ? 'Wybrany miesiac'
          : calendarView === 'week'
            ? 'Wybrany tydzien'
            : 'Wybrany dzien',
      value: `${visibleBookings.length} wizyt`,
    },
    {
      label: 'Potwierdzone',
      value: `${visibleBookings.filter((booking) => booking.status === 'Potwierdzona').length}`,
    },
    {
      label: 'W realizacji',
      value: `${visibleBookings.filter((booking) => booking.status === 'W realizacji').length}`,
    },
    {
      label: 'Do kontaktu',
      value: `${visibleBookings.filter((booking) => booking.status === 'Nowa').length}`,
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
            description: `${updatedBooking.vehicle} zostala oznaczona jako anulowana.`,
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

    deleteBookingMutation.mutate(
      { bookingId: bookingToDelete.id },
      {
        onSuccess: () => {
          setSelectedBookingId(null);
          setModalMode(null);
          setIsDeleteConfirmOpen(false);
          setIsMobileDetailsOpen(false);
          toast.error('Wizyta usunieta', {
            description: `${bookingToDelete.vehicle} zostala usunieta z harmonogramu.`,
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

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function handleSelectedDateChange(value: string) {
    if (!value) {
      return;
    }

    setSelectedDate(value);
  }

  function shiftSelectedPeriod(direction: -1 | 1) {
    setSelectedDate((current) => {
      if (calendarView === 'month') {
        return shiftDateByMonths(current, direction);
      }

      if (calendarView === 'week') {
        return shiftDateByDays(current, direction * 7);
      }

      return shiftDateByDays(current, direction);
    });
  }

  function openCreateModal() {
    setModalMode('create');
  }

  function openEditModal() {
    if (!selectedBooking) {
      return;
    }

    setIsMobileDetailsOpen(false);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
  }

  function closeBookingDetails() {
    setSelectedBookingId(null);
    setIsMobileDetailsOpen(false);
  }

  function handleSelectBooking(bookingId: string) {
    const nextBooking = bookings.find((booking) => booking.id === bookingId);

    setSelectedBookingId(bookingId);

    if (nextBooking && calendarView !== 'day') {
      setSelectedDate(nextBooking.date);
      setCalendarView('day');
      scrollBookingsPageToTop();
    }

    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
  }

  function handleSelectCalendarDate(dateString: string) {
    setSelectedDate(dateString);
    setCalendarView('day');
    scrollBookingsPageToTop();
  }

  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="Rezerwacje"
          title="Kalendarz, ktory naprawde porzadkuje dzien studia"
          metrics={metrics}
        />
      </div>

      <MobilePageHeader
        eyebrow="Rezerwacje"
        title={getMobileTitle(calendarView)}
        chips={[
          `${visibleBookings.length} wizyt`,
          `${
            visibleBookings.filter(
              (booking) => booking.status === 'W realizacji',
            ).length
          } w realizacji`,
        ]}
      />

      <BookingToolbar
        query={query}
        onQueryChange={handleQueryChange}
        calendarView={calendarView}
        onCalendarViewChange={setCalendarView}
        selectedDate={selectedDate}
        selectedRangeLabel={selectedRangeLabel}
        rangeLabelEyebrow={rangeLabelEyebrow}
        onSelectedDateChange={handleSelectedDateChange}
        onPreviousPeriod={() => shiftSelectedPeriod(-1)}
        onNextPeriod={() => shiftSelectedPeriod(1)}
        onToday={() => setSelectedDate(today)}
        onCreateClick={openCreateModal}
      />

      <section
        className={`grid min-h-180 min-w-0 gap-6 ${
          shouldShowBookingDetails
            ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
            : ''
        }`}
      >
        <div className="min-w-0 max-w-full">
          {isLoading && bookings.length === 0 ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-30 rounded-[26px]" />
              ))}
            </div>
          ) : calendarView === 'week' ? (
            <BookingWeekView
              bookings={visibleBookings}
              selectedBookingId={selectedBooking?.id ?? null}
              selectedDate={selectedDate}
              onSelect={handleSelectBooking}
              onDaySelect={handleSelectCalendarDate}
            />
          ) : calendarView === 'month' ? (
            <BookingMonthView
              bookings={visibleBookings}
              selectedDate={selectedDate}
              onDaySelect={handleSelectCalendarDate}
            />
          ) : (
            <BookingList
              bookings={visibleBookings}
              selectedBookingId={selectedBooking?.id ?? null}
              onSelect={handleSelectBooking}
            />
          )}
        </div>

        <div
          className={`min-w-0 max-w-full ${
            shouldShowBookingDetails ? 'hidden 2xl:block' : 'hidden'
          }`}
        >
          {isLoading ? (
            <Skeleton className="h-100 rounded-4xl" />
          ) : (
            <BookingDetails
              booking={selectedBooking ?? undefined}
              onEditClick={openEditModal}
              onCancelClick={handleCancelBooking}
              onDeleteClick={openDeleteConfirm}
              onCloseClick={closeBookingDetails}
            />
          )}
        </div>
      </section>

      <Dialog.Root
        open={
          !isDesktopDetailsLayout &&
          calendarView === 'day' &&
          isMobileDetailsOpen &&
          !!selectedBooking
        }
        onOpenChange={setIsMobileDetailsOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm 2xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-70 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none 2xl:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Szczegoly wizyty
                </p>
                <p className="mt-1 truncate text-sm text-stone-400">
                  {selectedBooking?.vehicle ?? 'Wybrana rezerwacja'}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                  aria-label="Zamknij szczegoly wizyty"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <BookingDetails
                booking={selectedBooking ?? undefined}
                onEditClick={openEditModal}
                onCancelClick={handleCancelBooking}
                onDeleteClick={openDeleteConfirm}
                onCloseClick={closeBookingDetails}
                variant="sheet"
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
          title="Usunac te wizyte?"
          description={`Ta akcja usunie z harmonogramu wizyte dla ${selectedBooking.vehicle}. Nadal bedzie mozna ja cofnac z toastu przez krotki moment.`}
          confirmLabel="Usun wizyte"
          tone="danger"
          onCancel={closeDeleteConfirm}
          onConfirm={handleDeleteBooking}
        />
      ) : null}
    </>
  );
}

function getMobileTitle(calendarView: BookingCalendarView) {
  switch (calendarView) {
    case 'week':
      return 'Plan tygodnia';
    case 'month':
      return 'Przeglad miesiaca';
    default:
      return 'Plan dnia';
  }
}

function formatSelectedDate(value: string, today: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return 'Nieprawidlowa data';
  }

  const formatted = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));

  if (value === today) {
    return `Dzis | ${formatted}`;
  }

  return formatted;
}

function scrollBookingsPageToTop() {
  if (typeof window === 'undefined') {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  });
}
