import QRCode from "qrcode";

export async function generateQRBlob(batchNumber: string, appURL?: string): Promise<Blob> {
  const base = (appURL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const url = `${base}/explore/batch/${batchNumber}`;

  const dataURL = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 512,
  });

  const res = await fetch(dataURL);
  return res.blob();
}
