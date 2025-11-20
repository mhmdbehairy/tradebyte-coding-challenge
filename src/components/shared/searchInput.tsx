import type { InputHTMLAttributes } from 'react';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  wrapperClassName?: string;
}

export const SearchInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputClassName = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none',
  wrapperClassName = 'space-y-2',
  ...inputProps
}: SearchInputProps) => (
  <div className={wrapperClassName}>
    <label htmlFor={id} className="text-sm font-medium text-slate-600">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClassName}
      {...inputProps}
    />
  </div>
);

export default SearchInput;
