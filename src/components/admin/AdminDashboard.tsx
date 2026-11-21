"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Guest = {
  id: string;
  guestName: string;
  email: string | null;
  attending: boolean;
  guestCount: number;
  dietaryLabels: string[];
  dietaryOther: string | null;
  message: string | null;
  createdAt: string;
  mealOption: { title: string } | null;
};

type Meal = {
  id: string;
  title: string;
  description: string;
  tag: string | null;
  sortOrder: number;
  active: boolean;
};

type Dietary = {
  id: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

type Settings = {
  initials: string;
  coupleNames: string;
  weddingDate: string;
  location: string;
  heroImageUrl: string | null;
  rsvpHeading: string;
  bankingHeading: string;
};

type Banking = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  notes: string | null;
  active: boolean;
};

type Tab = "guests" | "meals" | "dietary" | "banking" | "settings";

type DashboardData = {
  guests: Guest[];
  meals: Meal[];
  dietary: Dietary[];
  settings: Settings | null;
  banking: Banking | null;
};

export function AdminDashboard({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("guests");
  const [guests, setGuests] = useState<Guest[]>(initialData.guests);
  const [meals, setMeals] = useState<Meal[]>(initialData.meals);
  const [dietary, setDietary] = useState<Dietary[]>(initialData.dietary);
  const [settings, setSettings] = useState<Settings | null>(
    initialData.settings,
  );
  const [banking, setBanking] = useState<Banking | null>(initialData.banking);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    const [g, m, d, s, b] = await Promise.all([
      fetch("/api/admin/guests").then((r) => r.json()),
      fetch("/api/admin/meals").then((r) => r.json()),
      fetch("/api/admin/dietary").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/banking").then((r) => r.json()),
    ]);
    setGuests(g);
    setMeals(m);
    setDietary(d);
    setSettings(s);
    setBanking(b);
    setRefreshing(false);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const attending = guests.filter((g) => g.attending);
  const declined = guests.filter((g) => !g.attending);
  const totalGuests = attending.reduce((sum, g) => sum + g.guestCount, 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "guests", label: "Guests" },
    { id: "meals", label: "Meals" },
    { id: "dietary", label: "Dietary" },
    { id: "banking", label: "Banking" },
    { id: "settings", label: "Site" },
  ];

  return (
    <div className="min-h-screen bg-[#f0eeea] text-charcoal font-sans">
      <header className="bg-charcoal text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-sm tracking-[0.2em] uppercase">Wedding Admin</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/"
            className="text-xs tracking-widest uppercase opacity-70 hover:opacity-100"
          >
            View site
          </Link>
          <button
            onClick={logout}
            className="text-xs tracking-widest uppercase opacity-70 hover:opacity-100"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 p-6 max-w-6xl mx-auto">
        <StatCard label="Attending" value={attending.length} />
        <StatCard label="Declined" value={declined.length} />
        <StatCard label="Total guests" value={totalGuests} />
      </div>

      <nav className="flex gap-1 px-6 max-w-6xl mx-auto overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs tracking-widest uppercase whitespace-nowrap ${
              tab === t.id
                ? "bg-white text-charcoal shadow-sm"
                : "text-muted hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {refreshing ? (
          <p className="text-muted text-sm">Refreshing…</p>
        ) : (
          <>
            {tab === "guests" && <GuestsTab guests={guests} onRefresh={load} />}
            {tab === "meals" && <MealsTab meals={meals} onRefresh={load} />}
            {tab === "dietary" && (
              <DietaryTab options={dietary} onRefresh={load} />
            )}
            {tab === "banking" && banking && (
              <BankingTab banking={banking} onRefresh={load} />
            )}
            {tab === "settings" && settings && (
              <SettingsTab settings={settings} onRefresh={load} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 shadow-sm border border-black/5 text-center">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-xs tracking-widest uppercase text-muted mt-1">
        {label}
      </p>
    </div>
  );
}

function GuestsTab({
  guests,
  onRefresh,
}: {
  guests: Guest[];
  onRefresh: () => void;
}) {
  async function remove(id: string) {
    if (!confirm("Remove this RSVP?")) return;
    await fetch(`/api/admin/guests?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  if (guests.length === 0) {
    return <p className="text-muted text-sm">No RSVPs yet.</p>;
  }

  return (
    <div className="bg-white shadow-sm border border-black/5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs tracking-widest uppercase text-muted">
            <th className="p-4">Name</th>
            <th className="p-4">Status</th>
            <th className="p-4">Guests</th>
            <th className="p-4">Meal</th>
            <th className="p-4">Dietary</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id} className="border-b last:border-0">
              <td className="p-4 font-medium">{g.guestName}</td>
              <td className="p-4">
                <span className={g.attending ? "text-green-700" : "text-muted"}>
                  {g.attending ? "Attending" : "Declined"}
                </span>
              </td>
              <td className="p-4">{g.attending ? g.guestCount : "—"}</td>
              <td className="p-4 max-w-[200px]">
                {g.mealOption?.title ?? "—"}
              </td>
              <td className="p-4 max-w-[180px] text-muted">
                {[...g.dietaryLabels, g.dietaryOther]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </td>
              <td className="p-4">
                <button
                  onClick={() => remove(g.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MealsTab({
  meals,
  onRefresh,
}: {
  meals: Meal[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tag: "",
  });

  async function add() {
    if (!form.title.trim()) return;
    await fetch("/api/admin/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        tag: form.tag || null,
        sortOrder: meals.length,
      }),
    });
    setForm({ title: "", description: "", tag: "" });
    onRefresh();
  }

  async function toggleActive(meal: Meal) {
    await fetch("/api/admin/meals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...meal, active: !meal.active }),
    });
    onRefresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this meal option?")) return;
    await fetch(`/api/admin/meals?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm border border-black/5 space-y-4">
        <h3 className="text-xs tracking-widest uppercase text-muted">
          Add meal
        </h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-black/10 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-black/10 px-3 py-2 text-sm"
          rows={2}
        />
        <input
          placeholder="Tag e.g. VG"
          value={form.tag}
          onChange={(e) => setForm({ ...form, tag: e.target.value })}
          className="w-full border border-black/10 px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-accent text-white text-xs tracking-widest uppercase"
        >
          Add meal
        </button>
      </div>
      <ItemList
        items={meals.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: m.description,
          active: m.active,
        }))}
        onToggle={(id) => {
          const meal = meals.find((m) => m.id === id);
          if (meal) toggleActive(meal);
        }}
        onRemove={remove}
      />
    </div>
  );
}

function DietaryTab({
  options,
  onRefresh,
}: {
  options: Dietary[];
  onRefresh: () => void;
}) {
  const [label, setLabel] = useState("");

  async function add() {
    if (!label.trim()) return;
    await fetch("/api/admin/dietary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, sortOrder: options.length }),
    });
    setLabel("");
    onRefresh();
  }

  async function toggleActive(opt: Dietary) {
    await fetch("/api/admin/dietary", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...opt, active: !opt.active }),
    });
    onRefresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this option?")) return;
    await fetch(`/api/admin/dietary?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm border border-black/5 flex gap-3">
        <input
          placeholder="New dietary option"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 border border-black/10 px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-accent text-white text-xs tracking-widest uppercase shrink-0"
        >
          Add
        </button>
      </div>
      <ItemList
        items={options.map((o) => ({
          id: o.id,
          title: o.label,
          active: o.active,
        }))}
        onToggle={(id) => {
          const opt = options.find((o) => o.id === id);
          if (opt) toggleActive(opt);
        }}
        onRemove={remove}
      />
    </div>
  );
}

function BankingTab({
  banking,
  onRefresh,
}: {
  banking: Banking;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(banking);

  async function save() {
    await fetch("/api/admin/banking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onRefresh();
  }

  const fields: (keyof Banking)[] = [
    "accountName",
    "bankName",
    "accountNumber",
    "branchCode",
    "notes",
  ];

  return (
    <div className="bg-white p-6 shadow-sm border border-black/5 space-y-4 max-w-lg">
      {fields.map((key) => (
        <label key={key} className="block">
          <span className="text-xs tracking-widest uppercase text-muted block mb-1">
            {key.replace(/([A-Z])/g, " $1")}
          </span>
          <input
            value={String(form[key] ?? "")}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full border border-black/10 px-3 py-2 text-sm"
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Show on website
      </label>
      <button
        onClick={save}
        className="px-4 py-2 bg-accent text-white text-xs tracking-widest uppercase"
      >
        Save banking details
      </button>
    </div>
  );
}

function SettingsTab({
  settings,
  onRefresh,
}: {
  settings: Settings;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(settings);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onRefresh();
  }

  const fields: (keyof Settings)[] = [
    "initials",
    "coupleNames",
    "weddingDate",
    "location",
    "heroImageUrl",
    "rsvpHeading",
    "bankingHeading",
  ];

  return (
    <div className="bg-white p-6 shadow-sm border border-black/5 space-y-4 max-w-lg">
      {fields.map((key) => (
        <label key={key} className="block">
          <span className="text-xs tracking-widest uppercase text-muted block mb-1">
            {key.replace(/([A-Z])/g, " $1")}
          </span>
          <input
            value={String(form[key] ?? "")}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full border border-black/10 px-3 py-2 text-sm"
          />
        </label>
      ))}
      <button
        onClick={save}
        className="px-4 py-2 bg-accent text-white text-xs tracking-widest uppercase"
      >
        Save site settings
      </button>
    </div>
  );
}

function ItemList({
  items,
  onToggle,
  onRemove,
}: {
  items: { id: string; title: string; subtitle?: string; active: boolean }[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="bg-white shadow-sm border border-black/5 divide-y">
      {items.map((item) => (
        <li
          key={item.id}
          className={`p-4 flex items-start justify-between gap-4 ${!item.active ? "opacity-50" : ""}`}
        >
          <div>
            <p className="font-medium text-sm">{item.title}</p>
            {item.subtitle && (
              <p className="text-xs text-muted mt-1">{item.subtitle}</p>
            )}
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => onToggle(item.id)}
              className="text-xs text-muted hover:text-charcoal"
            >
              {item.active ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
