import type { ReactNode } from 'react';

type MasterDetailLayoutProps = {
  showDetails: boolean;
  list: ReactNode;
  details: ReactNode;
  className?: string;
  detailsClassName?: string;
};

export const MasterDetailLayout = ({
  showDetails,
  list,
  details,
  className = '',
  detailsClassName = '',
}: MasterDetailLayoutProps) => {
  return (
    <section
      className={`grid min-h-180 min-w-0 gap-6 ${
        showDetails
          ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
          : ''
      } ${className}`.trim()}
      style={{ overflowAnchor: 'none' }}
    >
      <div className="min-w-0 max-w-full">{list}</div>

      <div
        className={`min-w-0 max-w-full ${
          showDetails ? 'hidden 2xl:block' : 'hidden'
        } ${detailsClassName}`.trim()}
        style={{ overflowAnchor: 'none' }}
      >
        {details}
      </div>
    </section>
  );
};
