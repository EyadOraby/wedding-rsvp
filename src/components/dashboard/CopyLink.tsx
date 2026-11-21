"use client";

import { useEffect, useState } from "react";

/** Shows the event's public link with a copy button. */
export function CopyLink({ path }: { path: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The full link needs the browser's origin, which the server does not know.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.origin + path);
  }, [path]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-stone-100 px-3 py-2 text-sm">
        {url}
      </code>
      <button
        type="button"
        className="app-button-secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
