import { Plus, Search } from 'lucide-react';

type VehicleToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
};

export function VehicleToolbar({
  query,
  onQueryChange,
  onCreateClick,
}: VehicleToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          placeholder="Szukaj po rejestracji, marce, modelu lub właścicielu..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-white/8 bg-white/4 pl-11 pr-4 text-sm text-white placeholder-stone-500 transition-all focus:border-white/20 focus:bg-white/6 focus:outline-none focus:ring-4 focus:ring-white/2"
        />
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        Dodaj pojazd
      </button>
    </div>
  );
}
