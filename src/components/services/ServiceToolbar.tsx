import { EntityToolbar } from '../entity/EntityToolbar';

type ServiceToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateClick: () => void;
};

export const ServiceToolbar = ({
  query,
  onQueryChange,
  onCreateClick,
}: ServiceToolbarProps) => {
  return (
    <EntityToolbar
      query={query}
      onQueryChange={onQueryChange}
      onCreateClick={onCreateClick}
      searchPlaceholder="Szukaj uslugi..."
      createLabel="Nowa usluga"
    />
  );
};
