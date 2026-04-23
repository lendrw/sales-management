type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  "data-testid"?: string;
};

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i * 17) % 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function Table<T>({ columns, data, keyExtractor, loading, "data-testid": testId }: Props<T>) {
  const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm" data-testid={testId}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${alignClass[col.align ?? "left"]}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            : data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-slate-50/70 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-slate-700 ${alignClass[col.align ?? "left"]}`}
                    >
                      {col.render ? col.render(row) : String((row as never)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                Nenhum registro encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
