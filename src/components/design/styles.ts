export const surfaceStyles = {
  entityList:
    'w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4',
  detailPanel:
    'min-h-160 w-full max-w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]',
  emptyState:
    'flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5',
  softMetric: 'rounded-2xl border border-white/8 bg-black/14 px-4 py-3',
};

export const textStyles = {
  eyebrowAmber:
    'text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200',
  eyebrowMuted:
    'text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500',
  listTitle:
    'mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white',
  listCount: 'text-xs text-stone-400',
  listLeading: 'truncate text-sm font-semibold tracking-[-0.03em] text-white',
  listLeadingDesktop: 'text-base font-semibold tracking-[-0.03em] text-white',
  entityTitle: 'truncate text-sm font-semibold text-white',
  entityTitleMobile: 'truncate text-sm font-medium text-white',
  entityMeta: 'mt-0.5 truncate text-xs text-stone-400',
  trailingText: 'truncate text-xs text-stone-300',
};

export const layoutStyles = {
  listHeaderDesktop: 'hidden items-end justify-between gap-3 sm:flex',
  listHeaderMobile: 'mb-3 flex items-center justify-between sm:hidden',
  listItems: 'grid gap-2.5 sm:mt-3',
};

export const selectableItemStyles = {
  active:
    'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]',
  inactive:
    'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8',
  mobile:
    'grid w-full min-w-0 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition sm:hidden',
  desktop:
    'hidden w-full min-w-0 max-w-full grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left transition sm:grid',
  trailing: 'flex min-w-0 items-center justify-end gap-2',
};

export const buttonStyles = {
  modalSecondary:
    'w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 md:w-auto',
  modalPrimary:
    'w-full rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0 md:w-auto',
};
