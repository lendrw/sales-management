import { type InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-shadow duration-150",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            error
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-slate-200 hover:border-slate-300",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
