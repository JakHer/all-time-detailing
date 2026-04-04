import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { bookingStatuses, type Booking } from '../../data/bookings';
import type {
  ClientOption,
  ServiceOption,
  VehicleOption,
} from '../../lib/bookings';

const bookingSchema = z.object({
  client: z.string().trim().min(1, 'Wybierz klienta lub wpisz nazwę klienta.'),
  phone: z.string().trim().min(1, 'Podaj numer telefonu klienta.'),
  vehicle: z.string().trim().min(1, 'Wybierz pojazd lub wpisz model pojazdu.'),
  licensePlate: z.string().trim().min(1, 'Podaj numer rejestracyjny.'),
  date: z.string().trim().min(1, 'Wybierz datę wizyty.'),
  time: z.string().trim().min(1, 'Wybierz godzinę wizyty.'),
  service: z.string().trim().min(1, 'Wybierz usługę lub wpisz jej nazwę.'),
  duration: z.string().trim().min(1, 'Podaj planowany czas trwania.'),
  amount: z.string().trim().min(1, 'Podaj wartość wizyty.'),
  bay: z.string().trim().min(1, 'Podaj stanowisko.'),
  status: z.enum(bookingStatuses),
  notes: z.string(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

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

const copy = {
  createTitle: 'Dodaj rezerwację',
  editTitle: 'Zaktualizuj rezerwację',
  description:
    'Wybierz istniejącego klienta, pojazd i usługę z bazy Supabase, a formularz sam podpowie resztę danych wizyty.',
  stepClient: '1. Klient',
  stepClientDescription:
    'Najpierw wybierz klienta z bazy. Jeśli ma przypisany tylko jeden samochód, podpowiemy go automatycznie.',
  stepVehicle: '2. Pojazd',
  stepVehicleDescription:
    'Lista pojazdów zawęża się do aut przypisanych do wybranego klienta.',
  stepService: '3. Usługa i terminy',
  stepServiceDescription:
    'Usługa może uzupełnić sugerowany czas i kwotę, ale nadal możesz je poprawić.',
  pickClient: 'Wybierz klienta',
  phone: 'Telefon',
  clientVehicle: 'Pojazd klienta',
  pickVehicle: 'Wybierz pojazd',
  pickClientFirst: 'Najpierw wybierz klienta',
  noVehicles: 'Ten klient nie ma jeszcze przypisanego pojazdu',
  registration: 'Rejestracja',
  catalogService: 'Usługa z katalogu',
  pickService: 'Wybierz usługę',
  duration: 'Czas trwania',
  client: 'Klient',
  vehicle: 'Pojazd',
  service: 'Usługa',
  date: 'Data',
  time: 'Godzina',
  amount: 'Kwota',
  amountPlaceholder: 'np. 1 250 zł',
  bay: 'Stanowisko',
  status: 'Status',
  notes: 'Notatki',
  close: 'Zamknij',
  cancel: 'Anuluj',
  saveCreate: 'Zapisz rezerwację',
  saveEdit: 'Zapisz zmiany',
  autoHint:
    'Powiązane dane zostały uzupełnione automatycznie na podstawie wyboru.',
  emptyService: 'Brak wybranej usługi z katalogu',
  autoSelected: 'Podpowiedziano automatycznie',
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
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking ? mapBookingToValues(booking) : emptyFormValues,
  });

  const values = watch();

  const filteredVehicles = useMemo(
    () =>
      selectedClientId
        ? vehicles.filter((vehicle) => vehicle.clientId === selectedClientId)
        : [],
    [selectedClientId, vehicles],
  );

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );
  const selectedVehicle = filteredVehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );
  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  useEffect(() => {
    const nextValues = booking ? mapBookingToValues(booking) : emptyFormValues;
    reset(nextValues);

    const matchedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.registration === nextValues.licensePlate ||
        vehicle.label === nextValues.vehicle,
    );
    const inferredClientId = matchedVehicle?.clientId;
    const matchedClient =
      clients.find((client) => client.id === inferredClientId) ??
      clients.find(
        (client) =>
          client.fullName === nextValues.client &&
          client.phone === nextValues.phone,
      );
    const matchedService = services.find(
      (service) => service.name === nextValues.service,
    );

    setSelectedClientId(matchedClient?.id ?? '');
    setSelectedVehicleId(matchedVehicle?.id ?? '');
    setSelectedServiceId(matchedService?.id ?? '');
  }, [booking, clients, mode, reset, services, vehicles]);

  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    const alreadySelected = filteredVehicles.some(
      (vehicle) => vehicle.id === selectedVehicleId,
    );

    if (alreadySelected) {
      return;
    }

    if (filteredVehicles.length === 1) {
      const [singleVehicle] = filteredVehicles;
      setSelectedVehicleId(singleVehicle.id);
      setValue('vehicle', singleVehicle.label, { shouldDirty: true });
      setValue('licensePlate', singleVehicle.registration, {
        shouldDirty: true,
      });
      return;
    }

    setSelectedVehicleId('');
    setValue('vehicle', '', { shouldDirty: true });
    setValue('licensePlate', '', { shouldDirty: true });
  }, [filteredVehicles, selectedClientId, selectedVehicleId, setValue]);

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedVehicleId('');

    if (!clientId) {
      setValue('client', '', { shouldDirty: true });
      setValue('phone', '', { shouldDirty: true });
      setValue('vehicle', '', { shouldDirty: true });
      setValue('licensePlate', '', { shouldDirty: true });
      return;
    }

    const nextClient = clients.find((client) => client.id === clientId);

    if (!nextClient) {
      return;
    }

    setValue('client', nextClient.fullName, { shouldDirty: true });
    setValue('phone', nextClient.phone, { shouldDirty: true });
    setValue('vehicle', '', { shouldDirty: true });
    setValue('licensePlate', '', { shouldDirty: true });
  }

  function handleVehicleChange(vehicleId: string) {
    setSelectedVehicleId(vehicleId);

    if (!vehicleId) {
      setValue('vehicle', '', { shouldDirty: true });
      setValue('licensePlate', '', { shouldDirty: true });
      return;
    }

    const nextVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

    if (!nextVehicle) {
      return;
    }

    if (nextVehicle.clientId !== selectedClientId) {
      const owner = clients.find(
        (client) => client.id === nextVehicle.clientId,
      );
      if (owner) {
        setSelectedClientId(owner.id);
        setValue('client', owner.fullName, { shouldDirty: true });
        setValue('phone', owner.phone, { shouldDirty: true });
      }
    }

    setValue('vehicle', nextVehicle.label, { shouldDirty: true });
    setValue('licensePlate', nextVehicle.registration, { shouldDirty: true });
  }

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId);

    if (!serviceId) {
      setValue('service', '', { shouldDirty: true });
      return;
    }

    const nextService = services.find((service) => service.id === serviceId);

    if (!nextService) {
      return;
    }

    setValue('service', nextService.name, { shouldDirty: true });
    setValue('duration', formatDuration(nextService.durationMinutes), {
      shouldDirty: true,
    });
    setValue('amount', formatPrice(nextService.basePrice), {
      shouldDirty: true,
    });
  }

  function submit(valuesToSave: BookingFormValues) {
    if (mode === 'edit' && booking) {
      onSave({
        ...booking,
        ...valuesToSave,
      });
      return;
    }

    onSave(valuesToSave);
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
                {mode === 'create' ? copy.createTitle : copy.editTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                {copy.description}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
              >
                {copy.close}
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-black/18 p-4 md:grid-cols-3">
            <SelectionChip
              label={copy.stepClient}
              value={(selectedClient?.fullName ?? values.client) || '___'}
              helper={copy.stepClientDescription}
            />
            <SelectionChip
              label={copy.stepVehicle}
              value={(selectedVehicle?.label ?? values.vehicle) || '___'}
              helper={
                selectedVehicle
                  ? copy.autoSelected
                  : copy.stepVehicleDescription
              }
            />
            <SelectionChip
              label={copy.stepService}
              value={
                (selectedService?.name ?? values.service) || copy.emptyService
              }
              helper={
                selectedService
                  ? copy.autoSelected
                  : copy.stepServiceDescription
              }
            />
          </div>

          <form className="mt-8 grid gap-6" onSubmit={handleSubmit(submit)}>
            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title={copy.stepClient}
                description={copy.stepClientDescription}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.pickClient} error={errors.client?.message}>
                  <select
                    value={selectedClientId}
                    onChange={(event) => handleClientChange(event.target.value)}
                    className={inputClassName}
                  >
                    <option value="">{copy.pickClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.fullName} • {client.phone}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.phone} error={errors.phone?.message}>
                  <input {...register('phone')} className={inputClassName} />
                </Field>
                <Field label={copy.client} error={errors.client?.message}>
                  <input {...register('client')} className={inputClassName} />
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title={copy.stepVehicle}
                description={copy.stepVehicleDescription}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={copy.clientVehicle}
                  error={errors.vehicle?.message}
                >
                  <select
                    value={selectedVehicleId}
                    onChange={(event) =>
                      handleVehicleChange(event.target.value)
                    }
                    disabled={!selectedClientId}
                    className={inputClassName}
                  >
                    <option value="">
                      {!selectedClientId
                        ? copy.pickClientFirst
                        : filteredVehicles.length > 0
                          ? copy.pickVehicle
                          : copy.noVehicles}
                    </option>
                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.label} • {vehicle.registration}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.vehicle} error={errors.vehicle?.message}>
                  <input {...register('vehicle')} className={inputClassName} />
                </Field>
                <Field
                  label={copy.registration}
                  error={errors.licensePlate?.message}
                >
                  <input
                    {...register('licensePlate')}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title={copy.stepService}
                description={copy.stepServiceDescription}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={copy.catalogService}
                  error={errors.service?.message}
                >
                  <select
                    value={selectedServiceId}
                    onChange={(event) =>
                      handleServiceChange(event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">{copy.pickService}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.duration} error={errors.duration?.message}>
                  <input
                    {...register('duration')}
                    placeholder="np. 4 h"
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.service} error={errors.service?.message}>
                  <input {...register('service')} className={inputClassName} />
                </Field>
                <Field label={copy.amount} error={errors.amount?.message}>
                  <input
                    {...register('amount')}
                    placeholder={copy.amountPlaceholder}
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.date} error={errors.date?.message}>
                  <input
                    type="date"
                    {...register('date')}
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.time} error={errors.time?.message}>
                  <input
                    type="time"
                    {...register('time')}
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.bay} error={errors.bay?.message}>
                  <input {...register('bay')} className={inputClassName} />
                </Field>
                <Field label={copy.status} error={errors.status?.message}>
                  <select {...register('status')} className={inputClassName}>
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading title={copy.notes} description={copy.autoHint} />
              <Field label={copy.notes}>
                <textarea
                  {...register('notes')}
                  rows={5}
                  className={`${inputClassName} resize-none`}
                />
              </Field>
            </section>

            <div className="mt-2 flex flex-wrap justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
                >
                  {copy.cancel}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-full bg-linear-to-br from-amber-200 to-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(214,158,46,0.25)]"
              >
                {mode === 'create' ? copy.saveCreate : copy.saveEdit}
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
  error?: string;
};

type SectionHeadingProps = {
  title: string;
  description: string;
};

type SelectionChipProps = {
  label: string;
  value: string;
  helper: string;
};

function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-sm text-rose-300">{error}</span>
      ) : null}
    </label>
  );
}

function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
        {title}
      </p>
      <p className="text-sm leading-7 text-stone-400">{description}</p>
    </div>
  );
}

function SelectionChip({ label, value, helper }: SelectionChipProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
      <p className="mt-1 text-xs leading-6 text-stone-400">{helper}</p>
    </div>
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
