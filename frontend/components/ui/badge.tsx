type Variant = "green" | "yellow" | "red" | "blue" | "gray";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function Badge({ children, variant = "gray" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
