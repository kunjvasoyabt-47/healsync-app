import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-semibold text-text-muted  tracking-tight">{label}</label>
    <input
      ref={ref}
      className={`px-4 py-2 rounded-lg border bg-bg-surface transition-all outline-none focus:ring-2 
        ${error ? 'border-danger focus:ring-danger/20' : 'border-border-main focus:border-primary focus:ring-primary/20'}`}
      {...props}
    />
    {error && <span className="text-xs font-medium text-danger mt-1">{error}</span>}
  </div>
));

Input.displayName = "Input";
export default Input;