import type { NamedText, QuestionStats } from "@/lib/events/stats";

const MAX_TEXTS = 5;

function Bar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return (
    <li>
      <div className="flex justify-between gap-2 text-sm">
        <span className="truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-stone-600">
          {count} <span className="text-stone-400">· {percent}%</span>
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-stone-100">
        <div
          className="h-2 rounded-full bg-stone-800"
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  );
}

function TextList({ items, label }: { items: NamedText[]; label?: string }) {
  if (items.length === 0) return null;
  const shown = items.slice(-MAX_TEXTS).reverse();
  return (
    <div className="mt-3">
      {label && <p className="text-xs font-medium text-stone-500">{label}</p>}
      <ul className="mt-1 space-y-1 text-sm text-stone-700">
        {shown.map((item, i) => (
          <li key={i} className="rounded-md bg-stone-50 px-2 py-1">
            {item.text}
            <span className="text-stone-400"> · {item.name}</span>
          </li>
        ))}
      </ul>
      {items.length > MAX_TEXTS && (
        <p className="mt-1 text-xs text-stone-500">
          and {items.length - MAX_TEXTS} more in the table and CSV
        </p>
      )}
    </div>
  );
}

/** Counts per answer for one RSVP question. */
export function QuestionBreakdown({ stats }: { stats: QuestionStats }) {
  return (
    <div className="app-card p-5">
      <p className="font-medium">{stats.label}</p>
      <p className="text-xs text-stone-500">
        {stats.answered} {stats.answered === 1 ? "answer" : "answers"}
      </p>
      {(stats.type === "single" || stats.type === "multi") && (
        <>
          <ul className="mt-4 space-y-3">
            {stats.options.map((option) => (
              <Bar
                key={option.id}
                label={option.label}
                count={option.count}
                total={stats.answered}
              />
            ))}
          </ul>
          <TextList items={stats.other} label="Other" />
        </>
      )}
      {stats.type === "yesno" && (
        <ul className="mt-4 space-y-3">
          <Bar label="Yes" count={stats.yes} total={stats.answered} />
          <Bar label="No" count={stats.no} total={stats.answered} />
        </ul>
      )}
      {(stats.type === "text" || stats.type === "longtext") &&
        (stats.texts.length ? (
          <TextList items={stats.texts} />
        ) : (
          <p className="mt-3 text-sm text-stone-500">No answers yet.</p>
        ))}
    </div>
  );
}
