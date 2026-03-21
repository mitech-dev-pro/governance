type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

export default function BasicTable<T extends Record<string, unknown>>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <table className="min-w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="border-b border-slate-100">
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className="px-4 py-3 text-sm text-slate-700"
              >
                {column.render
                  ? column.render(row)
                  : String(row[column.key as keyof T])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
