/** Shown while dashboard pages load their data. */
export default function DashboardLoading() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse px-4 py-8"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-7 w-48 rounded bg-stone-200" />
      <div className="mt-2 h-4 w-72 rounded bg-stone-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="app-card h-44" />
        ))}
      </div>
    </main>
  );
}
