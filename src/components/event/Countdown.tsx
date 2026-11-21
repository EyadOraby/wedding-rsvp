"use client";

import { useEffect, useState } from "react";
import { daysUntil, formatEventDate } from "@/lib/events/format";

/** Computed in the browser so it uses the guest's own "today". */
export function Countdown({ date }: { date: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    // The server cannot know the guest's date, so compute it after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(daysUntil(date));
  }, [date]);

  let label = formatEventDate(date);
  if (days !== null && days > 1) label = `${days} days to go`;
  if (days === 1) label = "Tomorrow!";
  if (days === 0) label = "Today is the day!";
  if (days !== null && days < 0) label = "We hope you enjoyed it";

  return (
    <p className="ev-title text-5xl" aria-live="polite">
      {label}
    </p>
  );
}
