import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

const baseSelectClassName =
  'w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-200/30 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', wrapperClassName = '', children, ...props }, ref) => (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <select
        ref={ref}
        className={`${baseSelectClassName} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  ),
);

Select.displayName = 'Select';
