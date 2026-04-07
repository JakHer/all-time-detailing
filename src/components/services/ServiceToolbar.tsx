import { Plus, Search } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';

interface ServiceToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
}

export function ServiceToolbar({
  query,
  onQueryChange,
  onCreateClick,
}: ServiceToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          placeholder="Szukaj usługi po nazwie lub opisie..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-12 w-full rounded-2xl border border-white/8 bg-white/4 pl-11 pr-4 text-sm text-white placeholder-stone-500 transition-all focus:border-white/20 focus:bg-white/6 focus:outline-none focus:ring-4 focus:ring-white/2"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ActionButton icon={Plus} variant="solid" onClick={onCreateClick}>
          Nowa usługa
        </ActionButton>
      </div>
    </div>
  );
}
