import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ClientWithRelations } from '../../lib/clients';
import type { NewVehicle, Vehicle } from '../../lib/vehicles';
import { Select } from '../ui/Select';

const vehicleSchema = z.object({
  client_id: z.string().min(1, 'Wybierz właściciela pojazdu.'),
  make: z.string().min(1, 'Marka jest wymagana.'),
  model: z.string().min(1, 'Model jest wymagany.'),
  registration: z
    .string()
    .min(3, 'Numer rejestracyjny jest wymagany.')
    .transform((value) => value.toUpperCase().trim()),
  production_year: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d{4}$/.test(value),
      'Podaj rok w formacie RRRR.',
    ),
  color: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

type VehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewVehicle) => void | Promise<void>;
  initialData?: Vehicle | null;
  clients: ClientWithRelations[];
  title: string;
};

const inputClassName =
  'w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-stone-600 transition-all focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/2';

export function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  clients,
  title,
}: VehicleModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      client_id: '',
      make: '',
      model: '',
      registration: '',
      production_year: '',
      color: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      reset({
        client_id: initialData.client_id,
        make: initialData.make,
        model: initialData.model,
        registration: initialData.registration,
        production_year: initialData.production_year
          ? String(initialData.production_year)
          : '',
        color: initialData.color || '',
        notes: initialData.notes || '',
      });
      return;
    }

    reset({
      client_id: clients[0]?.id ?? '',
      make: '',
      model: '',
      registration: '',
      production_year: '',
      color: '',
      notes: '',
    });
  }, [clients, initialData, isOpen, reset]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-4xl border border-white/10 bg-[#161719] p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                Pojazdy
              </p>
              <Dialog.Title className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl text-sm leading-7 text-stone-400">
                Uzupełnij dane auta i przypisz właściciela, aby pojazd był
                gotowy do wykorzystania w rezerwacjach i historii usług.
              </Dialog.Description>
            </div>

            <Dialog.Close className="rounded-2xl border border-white/10 bg-white/6 p-2.5 text-stone-400 transition hover:border-white/16 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit(async (values) => {
              await onSubmit({
                client_id: values.client_id,
                make: values.make.trim(),
                model: values.model.trim(),
                registration: values.registration,
                production_year: values.production_year
                  ? Number(values.production_year)
                  : null,
                color: values.color?.trim() || null,
                notes: values.notes?.trim() || null,
              });
            })}
            className="mt-8 grid gap-6"
          >
            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Podstawowe dane"
                description="Te pola budują kartotekę auta i pozwolą szybko filtrować pojazdy w recepcji."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Właściciel" error={errors.client_id?.message}>
                  <Select {...register('client_id')} className={inputClassName}>
                    <option value="" className="bg-[#161719]">
                      Wybierz klienta
                    </option>
                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                        className="bg-[#161719]"
                      >
                        {client.full_name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Numer rejestracyjny"
                  error={errors.registration?.message}
                >
                  <input
                    {...register('registration')}
                    placeholder="np. WI 1234A"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Marka" error={errors.make?.message}>
                  <input
                    {...register('make')}
                    placeholder="np. BMW"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Model" error={errors.model?.message}>
                  <input
                    {...register('model')}
                    placeholder="np. 530d Touring"
                    className={inputClassName}
                  />
                </Field>

                <Field
                  label="Rok produkcji"
                  error={errors.production_year?.message}
                >
                  <input
                    {...register('production_year')}
                    placeholder="np. 2022"
                    inputMode="numeric"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Kolor" error={errors.color?.message}>
                  <input
                    {...register('color')}
                    placeholder="np. Czarny metalik"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Notatki"
                description="Miejsce na uwagi o lakierze, wnętrzu, uszkodzeniach lub historii detailingu."
              />

              <Field label="Notatki o pojeździe">
                <textarea
                  {...register('notes')}
                  rows={5}
                  placeholder="Auto po korekcie w 2024, rysa na tylnym zderzaku, klient prosi o ostrożność przy felgach..."
                  className={`${inputClassName} resize-none`}
                />
              </Field>
            </section>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-medium text-white transition hover:border-white/16 hover:bg-white/10"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting
                  ? 'Zapisywanie...'
                  : initialData
                    ? 'Zapisz zmiany'
                    : 'Dodaj pojazd'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-sm text-rose-300">{error}</span>
      ) : null}
    </label>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
        {title}
      </p>
      <p className="text-sm leading-7 text-stone-400">{description}</p>
    </div>
  );
}
