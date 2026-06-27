import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  User,
  Car,
  Wrench,
  Clock,
  CreditCard,
  Layout,
  Info,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { bookingStatuses, type Booking } from '../../data/bookings';
import {
  formatDuration,
  formatPrice,
  type ClientOption,
  type ServiceOption,
  type VehicleOption,
} from '../../lib/bookings';
import { Field, SectionTitle, inputClassName } from '../forms/FormElements';
import { FormModal } from '../forms/FormModal';
import { Select } from '../primitives/Select';
import { buttonStyles } from '../design/styles';
import { BookingScheduleField } from './BookingScheduleField';

const bookingSchema = z.object({
  client: z.string().trim().min(1, 'Wybierz klienta lub wpisz jego nazwę.'),
  phone: z.string().trim().min(1, 'Podaj numer telefonu klienta.'),
  vehicle: z.string().trim().min(1, 'Wybierz pojazd lub wpisz model pojazdu.'),
  licensePlate: z.string().trim().min(1, 'Podaj numer rejestracyjny.'),
  scheduledAt: z.string().trim().min(1, 'Wybierz termin wizyty.'),
  serviceId: z.string().trim().min(1, 'Wybierz usługę z katalogu.'),
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
  onSave: (booking: Booking | Omit<Booking, 'id'>) => void;
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

  const serviceOptions = useMemo(() => {
    if (
      !booking ||
      services.some((service) => service.name === booking.service)
    )
      return services;

    return [
      ...services,
      {
        id: `legacy-${booking.service}`,
        name: booking.service,
        durationMinutes: parseDurationMinutes(booking.duration),
        basePrice: parseAmountValue(booking.amount),
      },
    ];
  }, [booking, services]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking
      ? mapBookingToValues(booking, serviceOptions)
      : createEmptyFormValues(),
  });

  const values = watch();
  const filteredVehicles = useMemo(
    () =>
      selectedClientId
        ? vehicles.filter((vehicle) => vehicle.clientId === selectedClientId)
        : [],
    [selectedClientId, vehicles],
  );

  useEffect(() => {
    const nextValues = booking
      ? mapBookingToValues(booking, serviceOptions)
      : createEmptyFormValues();
    reset(nextValues);

    const matchedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.registration === booking?.licensePlate ||
        vehicle.label === booking?.vehicle,
    );
    const matchedClient =
      clients.find((client) => client.id === matchedVehicle?.clientId) ??
      clients.find(
        (client) =>
          client.fullName === booking?.client &&
          client.phone === booking?.phone,
      );

    setSelectedClientId(matchedClient?.id ?? '');
    setSelectedVehicleId(matchedVehicle?.id ?? '');
  }, [booking, clients, reset, serviceOptions, vehicles]);

  const lastAutoSelectedClientId = useRef('');

  useEffect(() => {
    if (!selectedClientId) {
      lastAutoSelectedClientId.current = '';
      setSelectedVehicleId('');
      return;
    }

    if (selectedClientId !== lastAutoSelectedClientId.current) {
      if (filteredVehicles.length === 1) {
        const [vehicle] = filteredVehicles;
        setSelectedVehicleId(vehicle.id);
        setValue('vehicle', vehicle.label, { shouldDirty: true });
        setValue('licensePlate', vehicle.registration, { shouldDirty: true });
      }
      lastAutoSelectedClientId.current = selectedClientId;
    }
  }, [filteredVehicles, selectedClientId, setValue]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [vehicles, selectedVehicleId],
  );

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedVehicleId('');
    if (!clientId) {
      setValue('client', '', { shouldDirty: true });
      setValue('phone', '', { shouldDirty: true });
      return;
    }

    const client = clients.find((item) => item.id === clientId);
    if (client) {
      setValue('client', client.fullName, { shouldDirty: true });
      setValue('phone', client.phone, { shouldDirty: true });
    }
  }

  function handleVehicleChange(vehicleId: string) {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId || vehicleId === 'new') {
      setValue('vehicle', '', { shouldDirty: true });
      setValue('licensePlate', '', { shouldDirty: true });
      return;
    }

    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (vehicle) {
      setValue('vehicle', vehicle.label, { shouldDirty: true });
      setValue('licensePlate', vehicle.registration, { shouldDirty: true });
    }
  }

  function handleServiceChange(serviceId: string) {
    const service = serviceOptions.find((item) => item.id === serviceId);
    setValue('serviceId', serviceId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (service) {
      setValue('duration', formatDuration(service.durationMinutes), {
        shouldDirty: true,
      });
      setValue('amount', formatPrice(service.basePrice), { shouldDirty: true });
    }
  }

  function onSubmit(data: BookingFormValues) {
    const service = serviceOptions.find((item) => item.id === data.serviceId);
    if (!service) return;

    const [date, timePart = '09:00'] = data.scheduledAt.split('T');
    const payload = {
      ...data,
      date,
      time: timePart.slice(0, 5),
      service: service.name,
    } satisfies Omit<Booking, 'id'>;

    onSave(mode === 'edit' && booking ? { ...booking, ...payload } : payload);
  }

  return (
    <FormModal
      open
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      icon={CalendarDays}
      title={mode === 'create' ? 'Nowa rezerwacja' : 'Edycja wizyty'}
      eyebrow={
        mode === 'create' ? 'Dodawanie do kalendarza' : 'Aktualizacja danych'
      }
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.modalSecondary}
          >
            Anuluj
          </button>
          <button type="submit" className={buttonStyles.modalPrimary}>
            {mode === 'create' ? 'Zatwierdź rezerwację' : 'Zapisz zmiany'}
          </button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-8">
          <section className="space-y-5">
            <SectionTitle icon={User} title="Klient i Pojazd" />

            <div className="grid gap-4">
              {!selectedClientId || selectedClientId === 'new' ? (
                <div className="grid gap-4 animate-in fade-in duration-300">
                  <Field label="Wybierz klienta z bazy">
                    <Select
                      value={selectedClientId}
                      onChange={(event) =>
                        handleClientChange(event.target.value)
                      }
                      className={inputClassName}
                    >
                      <option value="">Wybierz...</option>
                      <option value="new">+ Dodaj nowego klienta</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.fullName} | {client.phone}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  {selectedClientId === 'new' ? (
                    <div className="grid gap-4 animate-in slide-in-from-top-2 duration-300 md:grid-cols-2">
                      <Field
                        label="Imię i nazwisko"
                        error={errors.client?.message}
                      >
                        <input
                          {...register('client')}
                          placeholder="np. Jan Kowalski"
                          className={inputClassName}
                        />
                      </Field>
                      <Field label="Telefon" error={errors.phone?.message}>
                        <input
                          {...register('phone')}
                          placeholder="000 000 000"
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/10 bg-amber-400/5 p-4 animate-in zoom-in-95 duration-300">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {selectedClient?.fullName}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {selectedClient?.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClientChange('')}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-amber-200/60 hover:text-amber-200"
                  >
                    Zmień
                  </button>
                </div>
              )}

              <div className="my-2 h-px bg-white/5" />

              {!selectedVehicleId || selectedVehicleId === 'new' ? (
                <div className="grid gap-4 animate-in fade-in duration-300">
                  <Field label="Pojazd klienta">
                    <Select
                      value={selectedVehicleId}
                      onChange={(event) =>
                        handleVehicleChange(event.target.value)
                      }
                      disabled={!selectedClientId}
                      className={inputClassName}
                    >
                      <option value="">
                        {selectedClientId
                          ? 'Wybierz z listy...'
                          : 'Najpierw wybierz klienta'}
                      </option>
                      {selectedClientId ? (
                        <option value="new">+ Dodaj nowy pojazd</option>
                      ) : null}
                      {filteredVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.label} | {vehicle.registration}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  {selectedVehicleId === 'new' || selectedClientId === 'new' ? (
                    <div className="grid gap-4 animate-in slide-in-from-top-2 duration-300 md:grid-cols-2">
                      <Field
                        label="Marka i model"
                        error={errors.vehicle?.message}
                      >
                        <input
                          {...register('vehicle')}
                          placeholder="np. Audi A6"
                          className={inputClassName}
                        />
                      </Field>
                      <Field
                        label="Rejestracja"
                        error={errors.licensePlate?.message}
                      >
                        <input
                          {...register('licensePlate')}
                          placeholder="KR 12345"
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 animate-in zoom-in-95 duration-300">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-stone-400">
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {selectedVehicle?.label}
                      </p>
                      <p className="truncate text-[10px] font-mono uppercase text-stone-500">
                        {selectedVehicle?.registration}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      filteredVehicles.length > 1
                        ? handleVehicleChange('')
                        : handleVehicleChange('new')
                    }
                    className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-white"
                  >
                    {filteredVehicles.length > 1 ? 'Zmień' : 'Dodaj pojazd'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle icon={Wrench} title="Usługa" />
            <Field label="Usługa z katalogu" error={errors.serviceId?.message}>
              <Select
                value={values.serviceId}
                onChange={(event) => handleServiceChange(event.target.value)}
                className={inputClassName}
              >
                <option value="">Wybierz usługę...</option>
                {serviceOptions.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </Field>
          </section>
        </div>

        <div className="mt-8 space-y-8 border-t border-white/5 pt-8 lg:mt-0 lg:border-t-0 lg:pt-0">
          <section className="space-y-5">
            <SectionTitle icon={Clock} title="Termin i Logistyka" />
            <div className="grid gap-4">
              <Field label="Data i godzina" error={errors.scheduledAt?.message}>
                <Controller
                  control={control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <BookingScheduleField
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Czas trwania" error={errors.duration?.message}>
                  <div className="relative">
                    <input
                      {...register('duration')}
                      placeholder="2 h"
                      className={`${inputClassName} pl-10`}
                    />
                    <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  </div>
                </Field>
                <Field label="Kwota" error={errors.amount?.message}>
                  <div className="relative">
                    <input
                      {...register('amount')}
                      placeholder="500 zł"
                      className={`${inputClassName} pl-10`}
                    />
                    <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  </div>
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Stanowisko" error={errors.bay?.message}>
                  <div className="relative">
                    <input
                      {...register('bay')}
                      className={`${inputClassName} pl-10`}
                    />
                    <Layout className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  </div>
                </Field>
                <Field label="Status" error={errors.status?.message}>
                  <Select {...register('status')} className={inputClassName}>
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle icon={Info} title="Dodatkowe informacje" />
            <Field label="Notatki do rezerwacji">
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Wpisz ustalenia..."
                className={`${inputClassName} resize-none`}
              />
            </Field>
          </section>
        </div>
      </div>
    </FormModal>
  );
}

function createEmptyFormValues(): BookingFormValues {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);

  return {
    client: '',
    phone: '',
    vehicle: '',
    licensePlate: '',
    scheduledAt: `${createDateString(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    serviceId: '',
    duration: '2 h',
    amount: '0 zl',
    bay: 'Stanowisko 1',
    status: 'Nowa',
    notes: '',
  };
}

function mapBookingToValues(
  booking: Booking,
  services: ServiceOption[],
): BookingFormValues {
  return {
    client: booking.client,
    phone: booking.phone,
    vehicle: booking.vehicle,
    licensePlate: booking.licensePlate,
    scheduledAt: `${booking.date}T${booking.time}`,
    serviceId:
      services.find((service) => service.name === booking.service)?.id ?? '',
    duration: booking.duration,
    amount: booking.amount,
    bay: booking.bay,
    status: booking.status,
    notes: booking.notes,
  };
}

function createDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function parseDurationMinutes(duration: string) {
  const value = Number.parseFloat(duration.replace(/[^\d.]/g, ''));
  return Number.isNaN(value) ? 60 : Math.round(value * 60);
}

function parseAmountValue(amount: string) {
  const value = Number.parseFloat(amount.replace(/[^\d.]/g, ''));
  return Number.isNaN(value) ? 0 : value;
}
