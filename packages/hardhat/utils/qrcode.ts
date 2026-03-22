import QRCode from "qrcode";

export async function generateQRBuffer(batchNumber: string, appURL?: string): Promise<Buffer> {
  const url = `${appURL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/explore/batch/${batchNumber}`;

  return Buffer.from(
    await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 512,
    }),
  );
}

export async function generateQRDataURL(batchNumber: string, appURL?: string): Promise<string> {
  const url = `${appURL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/explore/batch/${batchNumber}`;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 512,
  });
}
