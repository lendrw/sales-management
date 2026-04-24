import { type SelectHTMLAttributes, forwardRef } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900",
            "transition-shadow duration-150 appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-200 hover:border-slate-300",
            className,
          ].join(" ")}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
