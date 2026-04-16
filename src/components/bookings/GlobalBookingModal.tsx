import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  createBooking,
  fetchBookingFormOptions,
  type BookingInsert,
} from '../../lib/bookings';
import { BookingModal } from './BookingModal';

const bookingsQueryKey = ['bookings'] as const;
const bookingFormOptionsQueryKey = ['booking-form-options'] as const;

export function GlobalBookingModal() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get('nowa') === '1';

  const { data: options } = useQuery({
    queryKey: bookingFormOptionsQueryKey,
    queryFn: fetchBookingFormOptions,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (newBooking: BookingInsert) => createBooking(newBooking),
    onSuccess: (booking) => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingsQueryKey }),
        queryClient.invalidateQueries({ queryKey: bookingFormOptionsQueryKey }),
      ]);

      handleClose();
      toast.success('Dodano rezerwacje', {
        description: `${booking.vehicle} zostala dodana do harmonogramu.`,
      });
    },
    onError: (error) => {
      toast.error('Nie udalo sie zapisac rezerwacji', {
        description:
          error instanceof Error
            ? error.message
            : 'Sprobuj ponownie za chwile.',
      });
    },
  });

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('nowa');
    setSearchParams(nextParams, { replace: true });
  }

  if (!isOpen) return null;

  return (
    <BookingModal
      mode="create"
      clients={options?.clients ?? []}
      vehicles={options?.vehicles ?? []}
      services={options?.services ?? []}
      onClose={handleClose}
      onSave={(data) => createMutation.mutate(data as BookingInsert)}
    />
  );
}
