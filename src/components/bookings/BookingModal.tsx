import { parseDate } from '@internationalized/date';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog as AriaDialog,
  Heading,
} from 'react-aria-components';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select } from '../ui/Select';
import { bookingStatuses, type Booking } from '../../data/bookings';
import {
  formatDuration,
  formatPrice,
  type ClientOption,
  type ServiceOption,
  type VehicleOption,
} from '../../lib/bookings';

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

const copy = {
  createTitle: 'Dodaj rezerwację',
  editTitle: 'Zaktualizuj rezerwację',
  description:
    'Wybierz istniejącego klienta, pojazd i usługę z bazy Supabase, a formularz sam podpowie resztę danych wizyty.',
  newVisit: 'Nowa wizyta',
  editVisit: 'Edycja wizyty',
  stepClient: '1. Klient',
  stepClientDescription:
    'Najpierw wybierz klienta z bazy. Jeśli ma przypisany tylko jeden samochód, podpowiemy go automatycznie.',
  stepVehicle: '2. Pojazd',
  stepVehicleDescription:
    'Lista pojazdów zawęża się do aut przypisanych do wybranego klienta.',
  stepService: '3. Usługa i termin',
  stepServiceDescription:
    'Usługa z katalogu podpowiada czas i kwotę, a termin ustawiasz w jednym polu z kalendarzem i godziną.',
  pickClient: 'Wybierz klienta',
  phone: 'Telefon',
  clientVehicle: 'Pojazd klienta',
  pickVehicle: 'Wybierz pojazd',
  pickClientFirst: 'Najpierw wybierz klienta',
  noVehicles: 'Ten klient nie ma jeszcze przypisanego pojazdu',
  registration: 'Rejestracja',
  catalogService: 'Usługa',
  pickService: 'Wybierz usługę',
  duration: 'Czas trwania',
  client: 'Klient',
  vehicle: 'Pojazd',
  schedule: 'Termin wizyty',
  amount: 'Kwota',
  amountPlaceholder: 'np. 1 250 zł',
  bay: 'Stanowisko',
  status: 'Status',
  notes: 'Notatki',
  notesDescription:
    'Tu możesz dopisać ustalenia z klientem, stan auta lub rzeczy do przypomnienia ekipie.',
  close: 'Zamknij',
  cancel: 'Anuluj',
  saveCreate: 'Zapisz rezerwację',
  saveEdit: 'Zapisz zmiany',
  emptyService: 'Brak wybranej usługi z katalogu',
  autoSelected: 'Podpowiedziano automatycznie',
  noSelection: 'Brak wyboru',
  openCalendar: 'Otwórz kalendarz',
  chooseDate: 'Wybierz datę',
  chooseTime: 'Godzina',
};

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-200/30 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60';

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
    ) {
      return services;
    }

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

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );
  const selectedService = serviceOptions.find(
    (service) => service.id === values.serviceId,
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
    const inferredClientId = matchedVehicle?.clientId;
    const matchedClient =
      clients.find((client) => client.id === inferredClientId) ??
      clients.find(
        (client) =>
          client.fullName === booking?.client &&
          client.phone === booking?.phone,
      );

    setSelectedClientId(matchedClient?.id ?? '');
    setSelectedVehicleId(matchedVehicle?.id ?? '');
  }, [booking, clients, reset, serviceOptions, vehicles]);

  useEffect(() => {
    if (!selectedClientId) {
      setSelectedVehicleId('');
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
    const nextService = serviceOptions.find(
      (service) => service.id === serviceId,
    );
    setValue('serviceId', serviceId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!nextService) {
      return;
    }

    setValue('duration', formatDuration(nextService.durationMinutes), {
      shouldDirty: true,
    });
    setValue('amount', formatPrice(nextService.basePrice), {
      shouldDirty: true,
    });
  }

  function submit(valuesToSave: BookingFormValues) {
    const chosenService = serviceOptions.find(
      (service) => service.id === valuesToSave.serviceId,
    );

    if (!chosenService) {
      return;
    }

    const [date, timeWithSeconds = '09:00'] =
      valuesToSave.scheduledAt.split('T');
    const time = timeWithSeconds.slice(0, 5);

    const payload = {
      client: valuesToSave.client,
      phone: valuesToSave.phone,
      vehicle: valuesToSave.vehicle,
      licensePlate: valuesToSave.licensePlate,
      date,
      time,
      service: chosenService.name,
      duration: valuesToSave.duration,
      amount: valuesToSave.amount,
      bay: valuesToSave.bay,
      status: valuesToSave.status,
      notes: valuesToSave.notes,
    } satisfies Omit<Booking, 'id'>;

    if (mode === 'edit' && booking) {
      onSave({ ...booking, ...payload });
      return;
    }

    onSave(payload);
  }

  return (
    <Dialog.Root open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-4xl border border-white/10 bg-[#121314] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.55)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                {mode === 'create' ? copy.newVisit : copy.editVisit}
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
              value={
                (selectedClient?.fullName ?? values.client) || copy.noSelection
              }
              helper={copy.stepClientDescription}
            />
            <SelectionChip
              label={copy.stepVehicle}
              value={
                (selectedVehicle?.label ?? values.vehicle) || copy.noSelection
              }
              helper={
                selectedVehicle
                  ? copy.autoSelected
                  : copy.stepVehicleDescription
              }
            />
            <SelectionChip
              label={copy.stepService}
              value={selectedService?.name ?? copy.emptyService}
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
                  <Select
                    value={selectedClientId}
                    onChange={(event) => handleClientChange(event.target.value)}
                    className={inputClassName}
                  >
                    <option value="">{copy.pickClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.fullName} | {client.phone}
                      </option>
                    ))}
                  </Select>
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
                  <Select
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
                        {vehicle.label} | {vehicle.registration}
                      </option>
                    ))}
                  </Select>
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
                  error={errors.serviceId?.message}
                >
                  <Select
                    value={values.serviceId}
                    onChange={(event) =>
                      handleServiceChange(event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">{copy.pickService}</option>
                    {serviceOptions.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label={copy.schedule}
                  error={errors.scheduledAt?.message}
                >
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
                <Field label={copy.duration} error={errors.duration?.message}>
                  <input
                    {...register('duration')}
                    placeholder="np. 4 h"
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.amount} error={errors.amount?.message}>
                  <input
                    {...register('amount')}
                    placeholder={copy.amountPlaceholder}
                    className={inputClassName}
                  />
                </Field>
                <Field label={copy.bay} error={errors.bay?.message}>
                  <input {...register('bay')} className={inputClassName} />
                </Field>
                <Field label={copy.status} error={errors.status?.message}>
                  <Select {...register('status')} className={inputClassName}>
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title={copy.notes}
                description={copy.notesDescription}
              />
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

type BookingScheduleFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function BookingScheduleField({ value, onChange }: BookingScheduleFieldProps) {
  const [datePart = createTodayDate(), timePart = '09:00'] = value.split('T');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const previousDateRef = useRef(datePart);
  const suppressNextToggleRef = useRef(false);

  useEffect(() => {
    if (!isCalendarOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        !calendarContainerRef.current?.contains(target)
      ) {
        setIsCalendarOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCalendarOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (previousDateRef.current !== datePart) {
      previousDateRef.current = datePart;
      setIsCalendarOpen(false);
      return;
    }

    previousDateRef.current = datePart;
  }, [datePart]);

  function updateDate(nextDate: string) {
    suppressNextToggleRef.current = true;
    onChange(`${nextDate}T${timePart}`);
  }

  function updateTime(nextTime: string) {
    onChange(`${datePart}T${nextTime}`);
  }

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_148px]">
      <div ref={calendarContainerRef} className="relative">
        <button
          type="button"
          onClick={() => {
            if (suppressNextToggleRef.current) {
              suppressNextToggleRef.current = false;
              return;
            }

            setIsCalendarOpen((open) => !open);
          }}
          className={`${inputClassName} flex items-center justify-between gap-3 text-left`}
          aria-label={copy.openCalendar}
          aria-expanded={isCalendarOpen}
        >
          <span>{formatDateLabel(datePart)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-stone-400" />
        </button>

        {isCalendarOpen ? (
          <div className="absolute left-0 top-[calc(100%+0.75rem)] z-60">
            <AriaDialog className="rounded-3xl border border-white/10 bg-[#121314] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
              <Calendar
                value={parseDate(datePart)}
                onChange={(nextValue) =>
                  nextValue ? updateDate(nextValue.toString()) : undefined
                }
                className="w-[320px] max-w-[calc(100vw-3rem)]"
              >
                <header className="flex items-center justify-between gap-3">
                  <AriaButton
                    slot="previous"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </AriaButton>
                  <Heading className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-200" />
                  <AriaButton
                    slot="next"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-200 transition hover:border-white/16 hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </AriaButton>
                </header>

                <CalendarGrid className="mt-4 w-full border-separate border-spacing-1">
                  <CalendarGridHeader>
                    {(day) => (
                      <CalendarHeaderCell className="pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className={({
                          isDisabled,
                          isOutsideMonth,
                          isSelected,
                          isToday,
                        }) =>
                          [
                            'flex h-10 w-10 items-center justify-center rounded-full text-sm outline-none transition',
                            isOutsideMonth
                              ? 'text-stone-600'
                              : 'text-stone-200',
                            isDisabled
                              ? 'cursor-not-allowed opacity-40'
                              : 'cursor-pointer',
                            isSelected
                              ? 'bg-amber-300 text-stone-950'
                              : 'hover:bg-white/10',
                            isToday && !isSelected
                              ? 'border border-amber-200/40'
                              : '',
                          ].join(' ')
                        }
                      />
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </AriaDialog>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <Select
          value={timePart}
          onChange={(event) => updateTime(event.target.value)}
          className={inputClassName}
          aria-label={copy.chooseTime}
        >
          {timeOptions.map((timeOption) => (
            <option key={timeOption} value={timeOption}>
              {timeOption}
            </option>
          ))}
        </Select>
      </div>
    </div>
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

function createEmptyFormValues(): BookingFormValues {
  return {
    client: '',
    phone: '',
    vehicle: '',
    licensePlate: '',
    scheduledAt: createInitialScheduledAt(),
    serviceId: '',
    duration: '',
    amount: '',
    bay: 'Stanowisko 1',
    status: 'Nowa',
    notes: '',
  };
}

function mapBookingToValues(
  booking: Booking,
  services: ServiceOption[],
): BookingFormValues {
  const matchingService = services.find(
    (service) => service.name === booking.service,
  );

  return {
    client: booking.client,
    phone: booking.phone,
    vehicle: booking.vehicle,
    licensePlate: booking.licensePlate,
    scheduledAt: `${booking.date}T${booking.time}`,
    serviceId: matchingService?.id ?? '',
    duration: booking.duration,
    amount: booking.amount,
    bay: booking.bay,
    status: booking.status,
    notes: booking.notes,
  };
}

function createInitialScheduledAt() {
  const value = new Date();
  value.setMinutes(Math.ceil(value.getMinutes() / 15) * 15, 0, 0);

  return `${createDateString(value)}T${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function createTodayDate() {
  return createDateString(new Date());
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return copy.chooseDate;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function createDateString(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-');
}

function parseDurationMinutes(duration: string) {
  const normalized = duration.replace(',', '.').trim();
  const numericValue = Number.parseFloat(normalized.replace(/[^\d.]/g, ''));

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return 60;
  }

  return Math.round(numericValue * 60);
}

function parseAmountValue(amount: string) {
  const normalized = amount.replace(',', '.').replace(/[^\d.]/g, '');
  const numericValue = Number.parseFloat(normalized);

  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0;
  }

  return numericValue;
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, '0');
  const minutes = String((index % 4) * 15).padStart(2, '0');

  return `${hours}:${minutes}`;
});
