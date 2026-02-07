import { DateTime } from "luxon";

export function generateInvoice(): string {
  const datePart = DateTime.now().setZone("Asia/Makassar").toFormat("yyMMdd");

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const getRandom = (source: string) =>
    source.charAt(Math.floor(Math.random() * source.length));

  const suffix =
    getRandom(alphabets) +
    getRandom(numbers) +
    getRandom(alphabets) +
    getRandom(numbers);

  return `INV-${datePart}-${suffix}`;
}

export function cleanInvoiceId(rawId: string): string {
  // Cara 1: Menggunakan Split (Paling simpel jika separatornya konsisten '-')
  const parts = rawId.split("-");
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }

  // Cara 2: Menggunakan Regex (Paling aman untuk validasi format)
  const regex = /INV-\d{6}-[A-Z]\d[A-Z]\d/;
  const match = rawId.match(regex);

  return match ? match[0] : rawId;
}
