import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-md border border-grey-200 bg-stone-050 px-3 py-2.5 text-sm text-navy-900 placeholder:text-grey-500 focus:border-teal-500";

export function FieldWrapper({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-alert"> *</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-grey-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

// react-hook-form's register() returns a `ref` that MUST reach the real DOM
// node for it to read/validate the field's live value — a plain function
// component silently drops any `ref` prop passed to it (React reserves
// `ref`, it never appears in `props`), so without forwardRef here every
// field using these wrappers would validate as permanently empty/undefined
// regardless of what the user typed.
export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "min-h-[120px]", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, className)} {...props}>
        {children}
      </select>
    );
  },
);
