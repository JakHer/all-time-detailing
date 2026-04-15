import { CalendarPlus2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../ui/ActionButton';
import { SearchField } from '../ui/SearchField';
import { ToolbarPanel } from '../ui/ToolbarPanel';

interface CustomerToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
}

export function CustomerToolbar({
  query,
  onQueryChange,
  onCreateClick,
}: CustomerToolbarProps) {
  const navigate = useNavigate();

  return (
    <ToolbarPanel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Szukaj klienta po imieniu, telefonie lub emailu..."
          className="sm:max-w-md"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ActionButton
            icon={CalendarPlus2}
            onClick={() => navigate('/rezerwacje?nowa=1')}
          >
            Dodaj rezerwację
          </ActionButton>

          <ActionButton icon={Plus} variant="solid" onClick={onCreateClick}>
            Nowy klient
          </ActionButton>
        </div>
      </div>
    </ToolbarPanel>
  );
}
