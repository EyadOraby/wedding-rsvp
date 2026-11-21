"use client";

import { useEffect, useState } from "react";
import { qrSvg } from "@/lib/events/qr";

/** QR code for the public link, with a download for print. */
export function ShareQr({ path, slug }: { path: string; slug: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    // The full link needs the browser's origin, which the server does not know.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSvg(qrSvg(window.location.origin + path));
  }, [path]);

  if (!svg) return <div className="h-32 w-32 rounded-lg bg-stone-100" />;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label="QR code for the event page"
        className="h-32 w-32 rounded-lg border border-stone-200 bg-white p-1"
        // Generated locally from the event link; contains only SVG shapes.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <a
        href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        download={`${slug}-qr.svg`}
        className="text-xs font-medium text-stone-700 underline"
      >
        Download QR code
      </a>
    </div>
  );
}
