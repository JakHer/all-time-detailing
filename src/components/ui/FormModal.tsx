import * as Dialog from '@radix-ui/react-dialog';
import { X, type LucideIcon } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';

const sizeClassNames = {
  sm: 'md:max-w-xl',
  md: 'md:max-w-2xl',
  lg: 'md:max-w-3xl',
  xl: 'md:max-w-5xl',
} as const;

type FormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  icon: LucideIcon;
  title: string;
  eyebrow: string;
  size?: keyof typeof sizeClassNames;
  children: ReactNode;
  footer: ReactNode;
  bodyClassName?: string;
};

export function FormModal({
  open,
  onClose,
  onSubmit,
  icon: Icon,
  title,
  eyebrow,
  size = 'md',
  children,
  footer,
  bodyClassName = '',
}: FormModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-80 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" />
        <Dialog.Content
          className={`fixed inset-0 z-90 flex h-dvh flex-col overflow-hidden bg-[#0d0e10] outline-none animate-in fade-in duration-300 md:left-1/2 md:top-1/2 md:h-auto md:max-h-[92vh] md:w-[calc(100%-2rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[40px] md:border md:border-white/10 md:shadow-[0_40px_120px_rgba(0,0,0,0.7)] md:zoom-in-95 ${sizeClassNames[size]}`.trim()}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-white/2 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:py-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 md:h-12 md:w-12">
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-lg font-bold tracking-tight text-white md:text-xl">
                  {title}
                </Dialog.Title>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-stone-500 md:text-xs">
                  {eyebrow}
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div
              className={`flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-8 md:py-8 ${bodyClassName}`.trim()}
            >
              {children}
            </div>
            <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/5 bg-white/2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:flex-row md:items-center md:justify-end md:px-8 md:py-5">
              {footer}
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
