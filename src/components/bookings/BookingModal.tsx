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
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  Car,
  Wrench,
  Clock,
  CreditCard,
  Layout,
  Info,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select } from '../ui/Select';
import { Field, SectionTitle, inputClassName } from '../ui/FormElements';
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
    if (!booking || services.some((s) => s.name === booking.service))
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
        ? vehicles.filter((v) => v.clientId === selectedClientId)
        : [],
    [selectedClientId, vehicles],
  );

  useEffect(() => {
    const nextValues = booking
      ? mapBookingToValues(booking, serviceOptions)
      : createEmptyFormValues();
    reset(nextValues);

    const matchedVehicle = vehicles.find(
      (v) =>
        v.registration === booking?.licensePlate ||
        v.label === booking?.vehicle,
    );
    const matchedClient =
      clients.find((c) => c.id === matchedVehicle?.clientId) ??
      clients.find(
        (c) => c.fullName === booking?.client && c.phone === booking?.phone,
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

    // Auto-select only once when client changes
    if (selectedClientId !== lastAutoSelectedClientId.current) {
      if (filteredVehicles.length === 1) {
        const [v] = filteredVehicles;
        setSelectedVehicleId(v.id);
        setValue('vehicle', v.label, { shouldDirty: true });
        setValue('licensePlate', v.registration, { shouldDirty: true });
      }
      lastAutoSelectedClientId.current = selectedClientId;
    }
  }, [filteredVehicles, selectedClientId, setValue]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId],
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId],
  );

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedVehicleId('');
    if (!clientId) {
      setValue('client', '', { shouldDirty: true });
      setValue('phone', '', { shouldDirty: true });
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setValue('client', client.fullName, { shouldDirty: true });
      setValue('phone', client.phone, { shouldDirty: true });
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId || vehicleId === 'new') {
      setValue('vehicle', '', { shouldDirty: true });
      setValue('licensePlate', '', { shouldDirty: true });
      return;
    }
    const v = vehicles.find((v) => v.id === vehicleId);
    if (v) {
      setValue('vehicle', v.label, { shouldDirty: true });
      setValue('licensePlate', v.registration, { shouldDirty: true });
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const s = serviceOptions.find((s) => s.id === serviceId);
    setValue('serviceId', serviceId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (s) {
      setValue('duration', formatDuration(s.durationMinutes), {
        shouldDirty: true,
      });
      setValue('amount', formatPrice(s.basePrice), { shouldDirty: true });
    }
  };

  const onSubmit = (data: BookingFormValues) => {
    const service = serviceOptions.find((s) => s.id === data.serviceId);
    if (!service) return;

    const [date, timePart = '09:00'] = data.scheduledAt.split('T');
    const payload = {
      ...data,
      date,
      time: timePart.slice(0, 5),
      service: service.name,
    } satisfies Omit<Booking, 'id'>;

    onSave(mode === 'edit' && booking ? { ...booking, ...payload } : payload);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[96vh] w-[calc(100%-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl border border-white/10 bg-[#0d0e10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300 lg:max-h-[92vh] lg:w-[calc(100%-4rem)] lg:rounded-[40px]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/2 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {mode === 'create' ? 'Nowa rezerwacja' : 'Edycja wizyty'}
                </h2>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-0.5">
                  {mode === 'create'
                    ? 'Dodawanie do kalendarza'
                    : 'Aktualizacja danych'}
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-8">
                  <section className="space-y-5">
                    <SectionTitle icon={User} title="Klient i Pojazd" />

                    <div className="grid gap-4">
                      {/* Client Selection */}
                      {!selectedClientId || selectedClientId === 'new' ? (
                        <div className="grid gap-4 animate-in fade-in duration-300">
                          <Field label="Wybierz klienta z bazy">
                            <Select
                              value={selectedClientId}
                              onChange={(e) =>
                                handleClientChange(e.target.value)
                              }
                              className={inputClassName}
                            >
                              <option value="">Wybierz...</option>
                              <option value="new">
                                + Dodaj nowego klienta
                              </option>
                              {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.fullName} | {c.phone}
                                </option>
                              ))}
                            </Select>
                          </Field>

                          {selectedClientId === 'new' && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
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
                              <Field
                                label="Telefon"
                                error={errors.phone?.message}
                              >
                                <input
                                  {...register('phone')}
                                  placeholder="000 000 000"
                                  className={inputClassName}
                                />
                              </Field>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-2xl border border-amber-200/10 bg-amber-400/5 p-4 animate-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {selectedClient?.fullName}
                              </p>
                              <p className="text-xs text-stone-500">
                                {selectedClient?.phone}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClientChange('')}
                            className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 hover:text-amber-200"
                          >
                            Zmień
                          </button>
                        </div>
                      )}

                      <div className="h-px bg-white/5 my-2" />

                      {/* Vehicle Selection */}
                      {!selectedVehicleId || selectedVehicleId === 'new' ? (
                        <div className="grid gap-4 animate-in fade-in duration-300">
                          <Field label="Pojazd klienta">
                            <Select
                              value={selectedVehicleId}
                              onChange={(e) =>
                                handleVehicleChange(e.target.value)
                              }
                              disabled={!selectedClientId}
                              className={inputClassName}
                            >
                              <option value="">
                                {selectedClientId
                                  ? 'Wybierz z listy...'
                                  : 'Najpierw wybierz klienta'}
                              </option>
                              {selectedClientId && (
                                <option value="new">+ Dodaj nowy pojazd</option>
                              )}
                              {filteredVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.label} | {v.registration}
                                </option>
                              ))}
                            </Select>
                          </Field>

                          {(selectedVehicleId === 'new' ||
                            selectedClientId === 'new') && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
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
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4 animate-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-stone-400">
                              <Car className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {selectedVehicle?.label}
                              </p>
                              <p className="text-[10px] font-mono text-stone-500 uppercase">
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
                            className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-white"
                          >
                            {filteredVehicles.length > 1
                              ? 'Zmień'
                              : 'Dodaj pojazd'}
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="space-y-5">
                    <SectionTitle icon={Wrench} title="Usługa" />
                    <Field
                      label="Usługa z katalogu"
                      error={errors.serviceId?.message}
                    >
                      <Select
                        value={values.serviceId}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">Wybierz usługę...</option>
                        {serviceOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </section>
                </div>

                <div className="space-y-8 mt-8 md:mt-0 border-t border-white/5 pt-8 md:border-t-0 md:pt-0">
                  <section className="space-y-5">
                    <SectionTitle icon={Clock} title="Termin i Logistyka" />
                    <div className="grid gap-4">
                      <Field
                        label="Data i godzina"
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
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Czas trwania"
                          error={errors.duration?.message}
                        >
                          <div className="relative">
                            <input
                              {...register('duration')}
                              placeholder="2 h"
                              className={`${inputClassName} pl-10`}
                            />
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          </div>
                        </Field>
                        <Field label="Kwota" error={errors.amount?.message}>
                          <div className="relative">
                            <input
                              {...register('amount')}
                              placeholder="500 zł"
                              className={`${inputClassName} pl-10`}
                            />
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          </div>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Stanowisko" error={errors.bay?.message}>
                          <div className="relative">
                            <input
                              {...register('bay')}
                              className={`${inputClassName} pl-10`}
                            />
                            <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          </div>
                        </Field>
                        <Field label="Status" error={errors.status?.message}>
                          <Select
                            {...register('status')}
                            className={inputClassName}
                          >
                            {bookingStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
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
            </div>
            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-white/2 px-6 py-5 md:px-8">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Anuluj
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                {mode === 'create' ? 'Zatwierdź rezerwację' : 'Zapisz zmiany'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BookingScheduleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [datePart = createTodayDate(), timePart = '09:00'] = value.split('T');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [isOpen]);
  return (
    <div className="grid grid-cols-[1fr_120px] gap-2">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`${inputClassName} flex items-center justify-between text-left`}
        >
          <span className="truncate">{formatDateLabel(datePart)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-stone-500" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-60 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AriaDialog className="rounded-3xl border border-white/10 bg-[#161719] p-4 shadow-2xl outline-none">
              <Calendar
                value={parseDate(datePart)}
                onChange={(d) => {
                  onChange(`${d.toString()}T${timePart}`);
                  setIsOpen(false);
                }}
              >
                <header className="flex items-center justify-between gap-4 mb-4">
                  <AriaButton
                    slot="previous"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </AriaButton>
                  <Heading className="text-xs font-bold uppercase tracking-widest text-white" />
                  <AriaButton
                    slot="next"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </AriaButton>
                </header>
                <CalendarGrid className="w-full border-separate border-spacing-1">
                  <CalendarGridHeader>
                    {(day) => (
                      <CalendarHeaderCell className="pb-2 text-[10px] font-bold text-stone-600 uppercase">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className={({ isSelected, isToday, isOutsideMonth }) =>
                          `flex h-9 w-9 items-center justify-center rounded-xl text-xs transition cursor-pointer outline-none ${isOutsideMonth ? 'text-stone-800' : 'text-stone-300'} ${isSelected ? 'bg-amber-400 !text-black font-bold' : 'hover:bg-white/10'} ${isToday && !isSelected ? 'ring-1 ring-amber-400/50' : ''}`
                        }
                      />
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </AriaDialog>
          </div>
        )}
      </div>
      <Select
        value={timePart}
        onChange={(e) => onChange(`${datePart}T${e.target.value}`)}
        className={inputClassName}
      >
        {timeOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
    </div>
  );
}

function createEmptyFormValues(): BookingFormValues {
  const n = new Date();
  n.setMinutes(Math.ceil(n.getMinutes() / 15) * 15, 0, 0);
  return {
    client: '',
    phone: '',
    vehicle: '',
    licensePlate: '',
    scheduledAt: `${createDateString(n)}T${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`,
    serviceId: '',
    duration: '2 h',
    amount: '0 zł',
    bay: 'Stanowisko 1',
    status: 'Nowa',
    notes: '',
  };
}
function mapBookingToValues(b: Booking, s: ServiceOption[]): BookingFormValues {
  return {
    client: b.client,
    phone: b.phone,
    vehicle: b.vehicle,
    licensePlate: b.licensePlate,
    scheduledAt: `${b.date}T${b.time}`,
    serviceId: s.find((x) => x.name === b.service)?.id ?? '',
    duration: b.duration,
    amount: b.amount,
    bay: b.bay,
    status: b.status,
    notes: b.notes,
  };
}
function createDateString(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}
function createTodayDate() {
  return createDateString(new Date());
}
function formatDateLabel(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}
function parseDurationMinutes(d: string) {
  const n = Number.parseFloat(d.replace(/[^\d.]/g, ''));
  return Number.isNaN(n) ? 60 : Math.round(n * 60);
}
function parseAmountValue(a: string) {
  const n = Number.parseFloat(a.replace(/[^\d.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0');
  const m = String((i % 4) * 15).padStart(2, '0');
  return `${h}:${m}`;
});
