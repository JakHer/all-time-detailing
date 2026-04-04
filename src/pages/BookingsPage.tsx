import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookingDetails } from "../components/bookings/BookingDetails";
import { BookingList } from "../components/bookings/BookingList";
import { BookingModal } from "../components/bookings/BookingModal";
import { BookingToolbar } from "../components/bookings/BookingToolbar";
import { PageIntro } from "../components/PageIntro";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  bookingStatuses,
  type Booking,
  type BookingStatus,
} from "../data/bookings";
import {
  createBooking,
  deleteBooking,
  fetchBookingFormOptions,
  fetchBookings,
  restoreBooking,
  updateBooking,
  updateBookingStatus,
  type ClientOption,
  type ServiceOption,
  type VehicleOption,
} from "../lib/bookings";

const allStatuses: Array<BookingStatus | "Wszystkie"> = [
  "Wszystkie",
  ...bookingStatuses,
];

type ModalMode = "create" | "edit" | null;
type NewBookingPayload = Omit<Booking, "id">;

function reportBookingError(error: unknown) {
  if (import.meta.env.DEV) {
    window.dispatchEvent(new CustomEvent("booking-error", { detail: error }));
  }
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "Wszystkie">(
    "Wszystkie",
  );
  const [query, setQuery] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    async function loadBookingsPage() {
      try {
        setIsLoading(true);
        const [bookingsData, options] = await Promise.all([
          fetchBookings(),
          fetchBookingFormOptions(),
        ]);

        if (!isMounted) {
          return;
        }

        setBookings(bookingsData);
        setClients(options.clients);
        setVehicles(options.vehicles);
        setServices(options.services);
        setSelectedBookingId(
          (current) => current ?? bookingsData[0]?.id ?? null,
        );
      } catch (error) {
        reportBookingError(error);
        toast.error("Nie udało się pobrać danych rezerwacji", {
          description:
            "Sprawdź połączenie z Supabase i czy schema SQL została uruchomiona poprawnie.",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBookingsPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === "Wszystkie" || booking.status === statusFilter;
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
    { label: "Dzisiaj", value: `${bookings.length} wizyt` },
    {
      label: "Potwierdzone",
      value: `${bookings.filter((booking) => booking.status === "Potwierdzona").length}`,
    },
    {
      label: "W realizacji",
      value: `${bookings.filter((booking) => booking.status === "W realizacji").length}`,
    },
    {
      label: "Do kontaktu",
      value: `${bookings.filter((booking) => booking.status === "Nowa").length}`,
    },
  ];

  async function handleSaveBooking(payload: Booking | NewBookingPayload) {
    try {
      if ("id" in payload) {
        const updatedBooking = await updateBooking(payload);
        setBookings((current) =>
          current.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking,
          ),
        );
        setSelectedBookingId(updatedBooking.id);
        setModalMode(null);
        toast.success("Wizyta zaktualizowana", {
          description: `${updatedBooking.vehicle} została zapisana z nowymi danymi.`,
        });
        return;
      }

      const newBooking = await createBooking(payload);
      setBookings((current) => [newBooking, ...current]);
      setSelectedBookingId(newBooking.id);
      setStatusFilter("Wszystkie");
      setQuery("");
      setModalMode(null);
      toast.success("Dodano rezerwację", {
        description: `${newBooking.vehicle} została dodana do planu dnia.`,
      });
    } catch (error) {
      reportBookingError(error);
      toast.error("Nie udało się zapisać rezerwacji", {
        description: "Sprawdź połączenie z Supabase i strukturę tabel.",
      });
    }
  }

  async function handleCancelBooking() {
    if (!selectedBooking || selectedBooking.status === "Anulowana") {
      return;
    }

    const previousBooking = selectedBooking;

    try {
      const updatedBooking = await updateBookingStatus(
        selectedBooking.id,
        "Anulowana",
      );
      setBookings((current) =>
        current.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking,
        ),
      );
      setSelectedBookingId(updatedBooking.id);
      toast.warning("Wizyta anulowana", {
        description: `${updatedBooking.vehicle} została oznaczona jako anulowana.`,
        action: {
          label: "Cofnij",
          onClick: async () => {
            try {
              const restoredBooking = await updateBookingStatus(
                previousBooking.id,
                previousBooking.status,
              );
              setBookings((current) =>
                current.map((booking) =>
                  booking.id === restoredBooking.id ? restoredBooking : booking,
                ),
              );
              setSelectedBookingId(restoredBooking.id);
            } catch (restoreError) {
              reportBookingError(restoreError);
              toast.error("Nie udało się cofnąć anulowania");
            }
          },
        },
      });
    } catch (error) {
      reportBookingError(error);
      toast.error("Nie udało się anulować wizyty");
    }
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

  async function handleDeleteBooking() {
    if (!selectedBooking) {
      return;
    }

    const bookingToDelete = selectedBooking;
    const remainingBookings = bookings.filter(
      (booking) => booking.id !== bookingToDelete.id,
    );
    const nextSelectedBookingId = remainingBookings[0]?.id ?? null;

    try {
      await deleteBooking(bookingToDelete.id);
      setBookings(remainingBookings);
      setSelectedBookingId(nextSelectedBookingId);
      setModalMode(null);
      setIsDeleteConfirmOpen(false);
      toast.error("Wizyta usunięta", {
        description: `${bookingToDelete.vehicle} została usunięta z harmonogramu.`,
        action: {
          label: "Cofnij",
          onClick: async () => {
            try {
              const restoredBooking = await restoreBooking(bookingToDelete);
              setBookings((current) => [restoredBooking, ...current]);
              setSelectedBookingId(restoredBooking.id);
            } catch (restoreError) {
              reportBookingError(restoreError);
              toast.error("Nie udało się przywrócić wizyty");
            }
          },
        },
      });
    } catch (error) {
      reportBookingError(error);
      toast.error("Nie udało się usunąć wizyty");
    }
  }

  function handleStatusFilterChange(value: BookingStatus | "Wszystkie") {
    setStatusFilter(value);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function openCreateModal() {
    setModalMode("create");
  }

  function openEditModal() {
    if (!selectedBooking) {
      return;
    }

    setModalMode("edit");
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
            onCancelClick={() => {
              void handleCancelBooking();
            }}
            onDeleteClick={openDeleteConfirm}
          />
        </div>
      </section>

      {modalMode ? (
        <BookingModal
          mode={modalMode}
          booking={
            modalMode === "edit" ? (selectedBooking ?? undefined) : undefined
          }
          clients={clients}
          vehicles={vehicles}
          services={services}
          onClose={closeModal}
          onSave={(payload) => {
            void handleSaveBooking(payload);
          }}
        />
      ) : null}

      {isDeleteConfirmOpen && selectedBooking ? (
        <ConfirmDialog
          title="Usunąć tę wizytę?"
          description={`Ta akcja usunie z harmonogramu wizytę dla ${selectedBooking.vehicle}. Nadal będzie można ją cofnąć z toastu przez krótki moment.`}
          confirmLabel="Usuń wizytę"
          tone="danger"
          onCancel={closeDeleteConfirm}
          onConfirm={() => {
            void handleDeleteBooking();
          }}
        />
      ) : null}
    </>
  );
}
