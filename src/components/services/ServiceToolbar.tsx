import { Plus } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';
import { SearchField } from '../ui/SearchField';
import { ToolbarPanel } from '../ui/ToolbarPanel';

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
    <ToolbarPanel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Szukaj usługi..."
          className="w-full sm:max-w-md"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ActionButton
            icon={Plus}
            variant="solid"
            onClick={onCreateClick}
            className="w-full sm:w-auto"
          >
            Nowa usługa
          </ActionButton>
        </div>
      </div>
    </ToolbarPanel>
  );
}
