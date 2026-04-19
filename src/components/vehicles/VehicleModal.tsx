import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Info, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ClientOption } from '../../lib/clients';
import type { NewVehicle, Vehicle } from '../../lib/vehicles';
import { Select } from '../ui/Select';
import { Field, SectionTitle, inputClassName } from '../ui/FormElements';
import { FormModal } from '../ui/FormModal';

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
  clients: ClientOption[];
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
    <FormModal
      open={isOpen}
      onClose={onClose}
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
      icon={Car}
      title={title}
      eyebrow="Zarządzanie parkiem maszyn"
      size="lg"
      bodyClassName="space-y-8"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 md:w-auto"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0 md:w-auto"
          >
            {isSubmitting
              ? 'Zapisywanie...'
              : initialData
                ? 'Zapisz zmiany'
                : 'Dodaj pojazd'}
          </button>
        </>
      }
    >
      <section className="space-y-5">
        <SectionTitle icon={Info} title="Podstawowe dane" />

        <div className="grid gap-4">
          <Field label="Właściciel" error={errors.client_id?.message}>
            <Select {...register('client_id')} className={inputClassName}>
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
            <div className="grid gap-4 md:grid-cols-2">
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
    </FormModal>
  );
}
