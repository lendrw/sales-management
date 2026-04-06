type Props = {
  current: number;
  last: number;
  onChange: (page: number) => void;
};

export default function Pagination({ current, last, onChange }: Props) {
  if (last <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        {current} / {last}
      </span>
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === last}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}
