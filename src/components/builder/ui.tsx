"use client";

import { useId } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="app-label">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date" | "time" | "url";
  multiline?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  maxLength,
  type = "text",
  multiline,
}: TextProps) {
  return (
    <Field label={label} hint={hint}>
      {(id) =>
        multiline ? (
          <textarea
            id={id}
            rows={4}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="app-input"
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="app-input"
          />
        )
      }
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-stone-900"
      />
      {label}
    </label>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Up, down and remove controls for an item in an ordered list. */
export function ListControls({
  index,
  count,
  onMove,
  onRemove,
  name,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove?: () => void;
  name: string;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <IconButton
        label={`Move ${name} up`}
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
      >
        ↑
      </IconButton>
      <IconButton
        label={`Move ${name} down`}
        onClick={() => onMove(index, index + 1)}
        disabled={index === count - 1}
      >
        ↓
      </IconButton>
      {onRemove && (
        <IconButton label={`Remove ${name}`} onClick={onRemove}>
          ✕
        </IconButton>
      )}
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
