import { zodResolver } from '@hookform/resolvers/zod';
import { Wrench, Info, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { NewService, Service } from '../../lib/services';
import { Field, SectionTitle, inputClassName } from '../ui/FormElements';
import { FormModal } from '../ui/FormModal';

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
    } else {
      reset({
        name: '',
        description: '',
        duration_minutes: 60,
        base_price: 0,
        is_active: true,
      });
    }
  }, [initialData, isOpen, reset]);

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      icon={Wrench}
      title={title}
      eyebrow="Katalog usług studia"
      size="md"
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
                : 'Dodaj usługę'}
          </button>
        </>
      }
    >
      <section className="space-y-5">
        <SectionTitle icon={Info} title="Podstawowe informacje" />

        <div className="grid gap-4">
          <Field label="Nazwa usługi" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="np. Mycie detailingowe"
              className={inputClassName}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
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
            <Field label="Cena bazowa (zł)" error={errors.base_price?.message}>
              <input
                {...register('base_price')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 p-4">
            <div className="relative flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 transition-all checked:bg-amber-400"
              />
              <CheckCircle2 className="pointer-events-none absolute left-1 top-1 h-4 w-4 text-black opacity-0 transition-opacity peer-checked:opacity-100" />
            </div>
            <label
              htmlFor="is_active"
              className="cursor-pointer text-sm font-medium text-stone-300"
            >
              Usługa aktywna i widoczna w ofercie
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle icon={MessageSquare} title="Opis usługi" />
        <Field label="Szczegółowy zakres prac">
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Opisz co dokładnie wchodzi w skład tej usługi..."
            className={`${inputClassName} resize-none`}
          />
        </Field>
      </section>
    </FormModal>
  );
}
