import { Skeleton } from '../primitives/Skeleton';

type ListSkeletonProps = {
  count?: number;
  itemClassName?: string;
};

export const ListSkeleton = ({
  count = 5,
  itemClassName = 'h-22 rounded-[26px]',
}: ListSkeletonProps) => {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={itemClassName} />
      ))}
    </div>
  );
};
