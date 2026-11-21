import qrcode from "qrcode-generator";

/** A scalable SVG QR code for a link, for printed invitations. */
export function qrSvg(url: string): string {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
