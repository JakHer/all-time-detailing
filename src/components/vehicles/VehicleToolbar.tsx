import { Plus } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';
import { SearchField } from '../ui/SearchField';
import { ToolbarPanel } from '../ui/ToolbarPanel';

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
    <ToolbarPanel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Szukaj pojazdu..."
          className="w-full sm:max-w-md"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <ActionButton
            icon={Plus}
            variant="solid"
            onClick={onCreateClick}
            className="w-full sm:w-auto"
          >
            Dodaj pojazd
          </ActionButton>
        </div>
      </div>
    </ToolbarPanel>
  );
}
