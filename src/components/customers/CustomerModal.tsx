import { zodResolver } from '@hookform/resolvers/zod';
import { User, Info, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Client, NewClient } from '../../lib/clients';
import { Field, SectionTitle, inputClassName } from '../forms/FormElements';
import { FormModal } from '../forms/FormModal';
import { buttonStyles } from '../design/styles';

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
    <FormModal
      open={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      icon={User}
      title={title}
      eyebrow="Zarządzanie bazą klientów"
      size="md"
      bodyClassName="space-y-8"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.modalSecondary}
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonStyles.modalPrimary}
          >
            {isSubmitting
              ? 'Zapisywanie...'
              : initialData
                ? 'Zapisz zmiany'
                : 'Dodaj klienta'}
          </button>
        </>
      }
    >
      <section className="space-y-5">
        <SectionTitle icon={Info} title="Dane kontaktowe" />

        <div className="grid gap-4">
          <Field label="Imię i nazwisko" error={errors.full_name?.message}>
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
    </FormModal>
  );
}
