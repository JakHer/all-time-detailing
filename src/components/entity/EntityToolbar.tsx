import { Plus } from 'lucide-react';
import { ToolbarPanel } from '../layout/ToolbarPanel';
import { ActionButton } from '../primitives/ActionButton';
import { SearchField } from '../primitives/SearchField';

type EntityToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
  searchPlaceholder: string;
  createLabel: string;
};

export const EntityToolbar = ({
  query,
  onQueryChange,
  onCreateClick,
  searchPlaceholder,
  createLabel,
}: EntityToolbarProps) => {
  return (
    <ToolbarPanel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder={searchPlaceholder}
          className="w-full sm:max-w-md"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <ActionButton
            icon={Plus}
            variant="solid"
            onClick={onCreateClick}
            className="w-full sm:w-auto"
          >
            {createLabel}
          </ActionButton>
        </div>
      </div>
    </ToolbarPanel>
  );
};
