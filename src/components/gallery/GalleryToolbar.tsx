import { ImagePlus, Search } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';

type GalleryToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onUploadClick: () => void;
};

export function GalleryToolbar({
  query,
  onQueryChange,
  onUploadClick,
}: GalleryToolbarProps) {
  return (
    <section className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.28)] md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Zasoby wizualne
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
              Biblioteka realizacji
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
              Przeglądaj zdjęcia prac, dokumentację stanu aut i materiały do
              portfolio.
            </p>
          </div>

          <ActionButton icon={ImagePlus} onClick={onUploadClick}>
            Dodaj zdjęcie
          </ActionButton>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/8 bg-black/18 p-3 md:p-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Szukaj w galerii
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 focus-within:border-amber-200/30 focus-within:bg-black/30">
                <Search className="h-4 w-4 text-stone-500" />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Szukaj po marce, modelu lub kliencie..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
