import * as Dialog from '@radix-ui/react-dialog';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import {
  bookingStatuses,
  type Booking,
  type BookingStatus,
} from '../../data/bookings';
import type {
  ClientOption,
  ServiceOption,
  VehicleOption,
} from '../../lib/bookings';

type BookingFormValues = Omit<Booking, 'id'>;

type BookingModalProps = {
  mode: 'create' | 'edit';
  booking?: Booking;
  clients: ClientOption[];
  vehicles: VehicleOption[];
  services: ServiceOption[];
  onClose: () => void;
  onSave: (booking: Booking | BookingFormValues) => void;
};

const emptyFormValues: BookingFormValues = {
  client: '',
  phone: '',
  vehicle: '',
  licensePlate: '',
  date: '2026-04-08',
  time: '',
  service: '',
  duration: '',
  amount: '',
  bay: 'Stanowisko 1',
  status: 'Nowa',
  notes: '',
};

export function BookingModal({
  mode,
  booking,
  clients,
  vehicles,
  services,
  onClose,
  onSave,
}: BookingModalProps) {
  const [values, setValues] = useState<BookingFormValues>(
    booking ? mapBookingToValues(booking) : emptyFormValues,
  );
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    const nextValues = booking ? mapBookingToValues(booking) : emptyFormValues;
    setValues(nextValues);

    const matchedClient = clients.find(
      (client) =>
        client.fullName === nextValues.client &&
        client.phone === nextValues.phone,
    );
    const matchedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.registration === nextValues.licensePlate ||
        vehicle.label === nextValues.vehicle,
    );
    const matchedService = services.find(
      (service) => service.name === nextValues.service,
    );

    setSelectedClientId(matchedClient?.id ?? '');
    setSelectedVehicleId(matchedVehicle?.id ?? '');
    setSelectedServiceId(matchedService?.id ?? '');
  }, [booking, clients, mode, services, vehicles]);

  const filteredVehicles = selectedClientId
    ? vehicles.filter((vehicle) => vehicle.clientId === selectedClientId)
    : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'edit' && booking) {
      onSave({
        ...booking,
        ...values,
      });
      return;
    }

    onSave(values);
  }

  function updateField<K extends keyof BookingFormValues>(
    field: K,
    value: BookingFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedVehicleId('');

    if (!clientId) {
      setValues((current) => ({
        ...current,
        client: '',
        phone: '',
        vehicle: '',
        licensePlate: '',
      }));
      return;
    }

    const selectedClient = clients.find((client) => client.id === clientId);

    if (!selectedClient) {
      return;
    }

    setValues((current) => ({
      ...current,
      client: selectedClient.fullName,
      phone: selectedClient.phone,
      vehicle: '',
      licensePlate: '',
    }));
  }

  function handleVehicleChange(vehicleId: string) {
    setSelectedVehicleId(vehicleId);

    if (!vehicleId) {
      setValues((current) => ({
        ...current,
        vehicle: '',
        licensePlate: '',
      }));
      return;
    }

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === vehicleId,
    );

    if (!selectedVehicle) {
      return;
    }

    setValues((current) => ({
      ...current,
      vehicle: selectedVehicle.label,
      licensePlate: selectedVehicle.registration,
    }));
  }

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId);

    if (!serviceId) {
      setValues((current) => ({
        ...current,
        service: '',
      }));
      return;
    }

    const selectedService = services.find(
      (service) => service.id === serviceId,
    );

    if (!selectedService) {
      return;
    }

    setValues((current) => ({
      ...current,
      service: selectedService.name,
      duration: formatDuration(selectedService.durationMinutes),
      amount: formatPrice(selectedService.basePrice),
    }));
  }

  return (
    <Dialog.Root open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[36px] border border-white/10 bg-[#121314] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.55)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                {mode === 'create' ? 'Nowa wizyta' : 'Edycja wizyty'}
              </p>
              <Dialog.Title className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {mode === 'create'
                  ? 'Dodaj rezerwację'
                  : 'Zaktualizuj rezerwację'}
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-7 text-stone-300">
                Wybierz istniejącego klienta, pojazd i usługę z bazy Supabase, a
                reszta pól uzupełni się szybciej.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
              >
                Zamknij
              </button>
            </Dialog.Close>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Klient z bazy">
                <select
                  value={selectedClientId}
                  onChange={(event) => handleClientChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Wybierz klienta</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} • {client.phone}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Telefon">
                <input
                  value={values.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Pojazd klienta">
                <select
                  value={selectedVehicleId}
                  onChange={(event) => handleVehicleChange(event.target.value)}
                  disabled={!selectedClientId}
                  className={inputClassName}
                >
                  <option value="">
                    {selectedClientId
                      ? 'Wybierz pojazd'
                      : 'Najpierw wybierz klienta'}
                  </option>
                  {filteredVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.label} • {vehicle.registration}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rejestracja">
                <input
                  value={values.licensePlate}
                  onChange={(event) =>
                    updateField('licensePlate', event.target.value)
                  }
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Usługa z katalogu">
                <select
                  value={selectedServiceId}
                  onChange={(event) => handleServiceChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Wybierz usługę</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Czas trwania">
                <input
                  value={values.duration}
                  onChange={(event) =>
                    updateField('duration', event.target.value)
                  }
                  placeholder="np. 4 h"
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Klient">
                <input
                  value={values.client}
                  onChange={(event) =>
                    updateField('client', event.target.value)
                  }
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Pojazd">
                <input
                  value={values.vehicle}
                  onChange={(event) =>
                    updateField('vehicle', event.target.value)
                  }
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Data">
                <input
                  type="date"
                  value={values.date}
                  onChange={(event) => updateField('date', event.target.value)}
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Godzina">
                <input
                  type="time"
                  value={values.time}
                  onChange={(event) => updateField('time', event.target.value)}
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Kwota">
                <input
                  value={values.amount}
                  onChange={(event) =>
                    updateField('amount', event.target.value)
                  }
                  placeholder="np. 1 250 zł"
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Stanowisko">
                <input
                  value={values.bay}
                  onChange={(event) => updateField('bay', event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="Status">
                <select
                  value={values.status}
                  onChange={(event) =>
                    updateField('status', event.target.value as BookingStatus)
                  }
                  className={inputClassName}
                >
                  {bookingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Notatki">
              <textarea
                value={values.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                rows={5}
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <div className="mt-2 flex flex-wrap justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
                >
                  Anuluj
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-full bg-linear-to-br from-amber-200 to-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(214,158,46,0.25)]"
              >
                {mode === 'create' ? 'Zapisz rezerwację' : 'Zapisz zmiany'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function mapBookingToValues(booking: Booking): BookingFormValues {
  return {
    date: booking.date,
    time: booking.time,
    client: booking.client,
    phone: booking.phone,
    vehicle: booking.vehicle,
    licensePlate: booking.licensePlate,
    service: booking.service,
    duration: booking.duration,
    amount: booking.amount,
    status: booking.status,
    bay: booking.bay,
    notes: booking.notes,
  };
}

function formatDuration(durationMinutes: number) {
  const hours = durationMinutes / 60;
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)} zł`;
}

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-200/30 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60';
