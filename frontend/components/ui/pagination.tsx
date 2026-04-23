import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  current: number;
  last: number;
  onChange: (page: number) => void;
};

export default function Pagination({ current, last, onChange }: Props) {
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-slate-400">
        Page {current} of {last}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          data-testid="pagination-prev"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} />
          Previous
        </button>
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === last}
          data-testid="pagination-next"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
