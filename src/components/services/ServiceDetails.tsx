import { Clock, Info, Pencil, Tag, Trash2 } from 'lucide-react';
import type { Service } from '../../lib/services';
import { Skeleton } from '../ui/Skeleton';

type ServiceDetailsProps = {
  service: Service | null;
  isLoading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

export function ServiceDetails({
  service,
  isLoading = false,
  onEditClick,
  onDeleteClick,
}: ServiceDetailsProps) {
  if (isLoading) {
    return <Skeleton className="min-h-120 rounded-4xl" />;
  }

  if (!service) {
    return (
      <article className="min-h-120 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
        <div className="flex min-h-100 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
          <div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              <Tag className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mt-6 font-semibold text-white/40">Wybierz usługę</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Wybierz usługę z listy po lewej, aby zobaczyć szczegóły, opis i
              parametry.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="min-h-120 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Szczegóły usługi
            </p>
            {!service.is_active && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                Nieaktywna
              </span>
            )}
          </div>
          <h3 className="mt-2 wrap-break-word text-3xl font-semibold tracking-[-0.04em] text-white">
            {service.name}
          </h3>
        </div>

        <div className="flex shrink-0 gap-2">
          <ActionIconButton label="Edytuj usługę" onClick={onEditClick}>
            <Pencil className="h-4.5 w-4.5" />
          </ActionIconButton>
          <ActionIconButton
            label="Usuń usługę"
            onClick={onDeleteClick}
            tone="danger"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </ActionIconButton>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<Clock className="h-4.5 w-4.5" />}
          label="Czas trwania"
          value={`${service.duration_minutes} min`}
        />
        <InfoCard
          icon={<Tag className="h-4.5 w-4.5" />}
          label="Cena bazowa"
          value={new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
          }).format(service.base_price)}
        />
      </div>

      <section className="mt-6 rounded-3xl border border-white/8 bg-black/18 p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Info className="h-4.5 w-4.5 opacity-40" />
          <h3>Opis usługi</h3>
        </div>
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/6 p-4">
          {service.description ? (
            <p className="break-words text-sm leading-7 text-stone-300">
              {service.description}
            </p>
          ) : (
            <p className="text-sm text-stone-500 italic">Brak opisu usługi.</p>
          )}
        </div>
      </section>
    </article>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

type ActionIconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/4 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
          {label}
        </p>
        <p className="mt-2 break-all text-sm leading-7 text-stone-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionIconButton({
  children,
  label,
  onClick,
  tone = 'default',
}: ActionIconButtonProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-300/20 bg-rose-300/12 text-rose-50 hover:border-rose-300/30 hover:bg-rose-300/18'
      : 'border-white/10 bg-white/6 text-white hover:border-white/16 hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${toneClasses}`}
    >
      {children}
    </button>
  );
}
