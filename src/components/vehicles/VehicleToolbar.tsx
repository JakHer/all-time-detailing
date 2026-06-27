import { EntityToolbar } from '../entity/EntityToolbar';

type VehicleToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
};

export const VehicleToolbar = ({
  query,
  onQueryChange,
  onCreateClick,
}: VehicleToolbarProps) => {
  return (
    <EntityToolbar
      query={query}
      onQueryChange={onQueryChange}
      onCreateClick={onCreateClick}
      searchPlaceholder="Szukaj pojazdu..."
      createLabel="Dodaj pojazd"
    />
  );
};
