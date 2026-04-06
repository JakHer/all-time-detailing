import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client, NewClient } from '../../lib/clients';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Imię i nazwisko jest wymagane (min. 2 znaki).'),
  phone: z.string().min(9, 'Numer telefonu jest wymagany (min. 9 cyfr).'),
  email: z
    .string()
    .email('Niepoprawny format e-mail.')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type CustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewClient) => void;
  initialData?: Client | null;
  title: string;
};

const inputClassName =
  'w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-stone-600 transition-all focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/2';

export function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: CustomerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      reset({
        full_name: initialData.full_name,
        phone: initialData.phone,
        email: initialData.email || '',
        notes: initialData.notes || '',
      });
      return;
    }

    reset({
      full_name: '',
      phone: '',
      email: '',
      notes: '',
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
                Klienci
              </p>
              <Dialog.Title className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl text-sm leading-7 text-stone-400">
                Uzupełnij podstawowe dane kontaktowe i notatki, żeby recepcja
                miała pełny obraz relacji z klientem.
              </Dialog.Description>
            </div>

            <Dialog.Close className="rounded-2xl border border-white/10 bg-white/6 p-2.5 text-stone-400 transition hover:border-white/16 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6">
            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Dane kontaktowe"
                description="Te pola wykorzystamy później w rezerwacjach, przypisanych pojazdach i historii wizyt."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Imię i nazwisko"
                  error={errors.full_name?.message}
                >
                  <input
                    {...register('full_name')}
                    placeholder="np. Jan Kowalski"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Telefon" error={errors.phone?.message}>
                  <input
                    {...register('phone')}
                    placeholder="+48 000 000 000"
                    className={inputClassName}
                  />
                </Field>

                <Field label="E-mail" error={errors.email?.message}>
                  <input
                    {...register('email')}
                    placeholder="jan@przyklad.pl"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </section>

            <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/4 p-5">
              <SectionHeading
                title="Notatki"
                description="Tu możesz zapisać preferencje klienta, historię komunikacji albo rzeczy ważne dla zespołu."
              />

              <Field label="Notatki o kliencie">
                <textarea
                  {...register('notes')}
                  rows={5}
                  placeholder="Preferuje odbiór po 18:00, zostawia auto zastępcze..."
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
                    : 'Dodaj klienta'}
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
