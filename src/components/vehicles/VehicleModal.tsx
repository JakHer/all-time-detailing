import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Car, Info, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ClientWithRelations } from '../../lib/clients';
import type { NewVehicle, Vehicle } from '../../lib/vehicles';
import { Select } from '../ui/Select';
import { Field, SectionTitle, inputClassName } from '../ui/FormElements';

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
    if (!isOpen) return;
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
    } else {
      reset({
        client_id: clients[0]?.id ?? '',
        make: '',
        model: '',
        registration: '',
        production_year: '',
        color: '',
        notes: '',
      });
    }
  }, [clients, initialData, isOpen, reset]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[96vh] w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl border border-white/10 bg-[#0d0e10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300 md:max-h-[92vh] md:w-[calc(100%-2rem)] md:rounded-[40px]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/2 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {title}
                </h2>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-0.5">
                  Zarządzanie parkiem maszyn
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

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
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 space-y-8">
              <section className="space-y-5">
                <SectionTitle icon={Info} title="Podstawowe dane" />

                <div className="grid gap-4">
                  <Field label="Właściciel" error={errors.client_id?.message}>
                    <Select
                      {...register('client_id')}
                      className={inputClassName}
                    >
                      <option value="">Wybierz klienta</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.full_name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
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
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Rok produkcji"
                        error={errors.production_year?.message}
                      >
                        <input
                          {...register('production_year')}
                          placeholder="2022"
                          inputMode="numeric"
                          className={inputClassName}
                        />
                      </Field>
                      <Field label="Kolor" error={errors.color?.message}>
                        <input
                          {...register('color')}
                          placeholder="np. Czarny"
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <SectionTitle icon={MessageSquare} title="Notatki" />
                <Field label="Notatki o pojeździe">
                  <textarea
                    {...register('notes')}
                    rows={5}
                    placeholder="Uwagi o lakierze, historii detailingu..."
                    className={`${inputClassName} resize-none`}
                  />
                </Field>
              </section>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-white/2 px-6 py-5 md:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting
                  ? 'Zapisywanie...'
                  : initialData
                    ? 'Zapisz zmiany'
                    : 'Dodaj pojazd'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
