import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, Info, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client, NewClient } from '../../lib/clients';
import { Field, SectionTitle, inputClassName } from '../ui/FormElements';

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
    if (!isOpen) return;
    if (initialData) {
      reset({
        full_name: initialData.full_name,
        phone: initialData.phone,
        email: initialData.email || '',
        notes: initialData.notes || '',
      });
    } else {
      reset({ full_name: '', phone: '', email: '', notes: '' });
    }
  }, [initialData, isOpen, reset]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[96vh] w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl border border-white/10 bg-[#0d0e10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300 md:max-h-[92vh] md:w-[calc(100%-2rem)] md:rounded-[40px]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/2 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {title}
                </h2>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-0.5">
                  Zarządzanie bazą klientów
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
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 space-y-8">
              <section className="space-y-5">
                <SectionTitle icon={Info} title="Dane kontaktowe" />

                <div className="grid gap-4">
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
                  <div className="grid gap-4 md:grid-cols-2">
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
                </div>
              </section>

              <section className="space-y-5">
                <SectionTitle icon={MessageSquare} title="Notatki" />
                <Field label="Notatki o kliencie">
                  <textarea
                    {...register('notes')}
                    rows={5}
                    placeholder="Preferencje klienta, historia komunikacji..."
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
                    : 'Dodaj klienta'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
