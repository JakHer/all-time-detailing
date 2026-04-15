import { Search } from 'lucide-react';

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
};

export function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
  compact = false,
}: SearchFieldProps) {
  return (
    <div
      className={`flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 ${
        compact ? 'py-3' : 'h-12'
      } focus-within:border-amber-200/30 focus-within:bg-black/30 ${className}`.trim()}
    >
      <Search className="h-4 w-4 shrink-0 text-stone-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500 ${inputClassName}`.trim()}
      />
    </div>
  );
}
