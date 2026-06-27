import * as Dialog from '@radix-ui/react-dialog';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'danger' | 'warning';
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = 'danger',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmButtonClassName =
    tone === 'danger'
      ? 'border-rose-300/20 bg-rose-300/12 text-rose-50 hover:border-rose-300/30 hover:bg-rose-300/18'
      : 'border-amber-300/20 bg-amber-300/12 text-amber-50 hover:border-amber-300/30 hover:bg-amber-300/18';

  return (
    <Dialog.Root open onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 bg-black/70 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-70 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-4xl border border-white/10 bg-[#121314] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.55)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Potwierdzenie akcji
          </p>
          <Dialog.Title className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-4 text-sm leading-7 text-stone-300">
            {description}
          </Dialog.Description>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white transition hover:border-white/16 hover:bg-white/10"
              >
                Wróć
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${confirmButtonClassName}`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
