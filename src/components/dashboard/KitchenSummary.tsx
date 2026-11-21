type Row = { name: string; guests: number; answers: string[] };

/** Food answers per guest who is coming, ready to send to the caterer. */
export function KitchenSummary({
  eventId,
  labels,
  rows,
}: {
  eventId: string;
  labels: string[];
  rows: Row[];
}) {
  if (labels.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="kitchen-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="kitchen-heading" className="text-lg font-semibold">
            Kitchen summary
          </h2>
          <p className="text-sm text-stone-600">
            Meals, dietary needs and allergies of everyone who is coming.
          </p>
        </div>
        <a
          href={`/api/events/${eventId}/export?view=kitchen`}
          className="app-button-secondary"
        >
          Download for the caterer
        </a>
      </div>
      <div className="app-card mt-4 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">
            No food answers yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Party</th>
                {labels.map((label) => (
                  <th key={label} className="px-4 py-2 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((row, i) => (
                <tr key={i} className="align-top">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 tabular-nums">{row.guests}</td>
                  {row.answers.map((answer, j) => (
                    <td key={j} className="px-4 py-3">
                      {answer || <span className="text-stone-300">–</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
