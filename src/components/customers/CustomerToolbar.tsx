import { EntityToolbar } from '../entity/EntityToolbar';

type CustomerToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
};

export const CustomerToolbar = ({
  query,
  onQueryChange,
  onCreateClick,
}: CustomerToolbarProps) => {
  return (
    <EntityToolbar
      query={query}
      onQueryChange={onQueryChange}
      onCreateClick={onCreateClick}
      searchPlaceholder="Szukaj klienta..."
      createLabel="Nowy klient"
    />
  );
};
