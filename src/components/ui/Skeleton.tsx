import RLSkeleton, {
  SkeletonProps as RLSkeletonProps,
} from 'react-loading-skeleton';

export function Skeleton({ className, ...props }: RLSkeletonProps) {
  return (
    <RLSkeleton
      className={`block leading-none ${className ?? ''}`}
      {...props}
    />
  );
}
