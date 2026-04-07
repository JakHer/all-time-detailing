import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { NewService, Service } from '../../lib/services';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nazwa usługi musi mieć min. 3 znaki.'),
  description: z.string().optional().or(z.literal('')),
  duration_minutes: z.coerce.number().min(5, 'Minimalny czas to 5 minut.'),
  base_price: z.coerce.number().min(0, 'Cena nie może być ujemna.'),
  is_active: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

type ServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewService) => void;
  initialData?: Service | null;
  title: string;
};

const inputClassName =
  'w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-stone-600 transition-all focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/2';

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: ServiceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      duration_minutes: 60,
      base_price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        duration_minutes: initialData.duration_minutes,
        base_price: initialData.base_price,
        is_active: initialData.is_active,
      });
      return;
    }

    reset({
      name: '',
      description: '',
      duration_minutes: 60,
      base_price: 0,
      is_active: true,
    });
  }, [initialData, isOpen, reset]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-4xl border border-white/10 bg-[#161719] p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                Katalog usług
              </p>
              <Dialog.Title className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl text-sm leading-7 text-stone-400">
                Zdefiniuj parametry usługi, aby recepcja mogła sprawnie planować
                rezerwacje i wyceniać prace.
              </Dialog.Description>
            </div>

            <Dialog.Close className="rounded-2xl border border-white/10 bg-white/6 p-2.5 text-stone-400 transition hover:border-white/16 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6">
            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Podstawowe informacje"
                description="Nazwa i parametry czasowo-finansowe usługi."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nazwa usługi" error={errors.name?.message}>
                  <input
                    {...register('name')}
                    placeholder="np. Mycie detailingowe"
                    className={inputClassName}
                  />
                </Field>

                <Field
                  label="Czas trwania (min)"
                  error={errors.duration_minutes?.message}
                >
                  <input
                    {...register('duration_minutes')}
                    type="number"
                    placeholder="60"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Cena bazowa" error={errors.base_price?.message}>
                  <input
                    {...register('base_price')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={inputClassName}
                  />
                </Field>

                <div className="flex items-center gap-3 px-1 py-4">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    id="is_active"
                    className="h-5 w-5 rounded-lg border-white/10 bg-white/4 text-amber-200 focus:ring-amber-200/20"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-white"
                  >
                    Usługa aktywna i widoczna w ofercie
                  </label>
                </div>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Opis"
                description="Szczegółowy zakres prac widoczny dla zespołu."
              />

              <Field label="Zakres prac">
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Opisz co wchodzi w skład usługi..."
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
                    : 'Dodaj usługę'}
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
  children: React.ReactNode;
  error?: string;
};

type SectionHeadingProps = {
  title: string;
  description: string;
};

function Field({ label, children, error }: FieldProps) {
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
