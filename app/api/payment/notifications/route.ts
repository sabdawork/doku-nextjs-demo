import { ref, set } from "firebase/database";
import { type NextRequest, NextResponse } from "next/server";
import { rtdb } from "@/lib/firebase";
import { cleanInvoiceId } from "@/lib/util";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(JSON.stringify({ body }, null, 2));

    // 1. Ambil data penting dari payload DOKU
    // DOKU biasanya mengirimkan status dalam body.transaction.status
    const invoiceId = cleanInvoiceId(body.order.invoice_number || "");
    const status = body.transaction.status; // SUCCESS, FAILED, atau EXPIRED

    try {
      await fetch(
        "https://api-staging-theluc.nusadigital.com/v1/webhook/doku",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body,
          }),
        },
      );
    } catch (error) {
      console.error("Error forwarding to staging webhook:", error);
    }

    if (!invoiceId) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // 2. Update status ke Realtime Database
    // Path: invoice-status/INV-260208-A1B2
    const statusRef = ref(rtdb, `invoice-status/${invoiceId}`);

    await set(statusRef, {
      status: status,
      updatedAt: Date.now(),
      // Simpan seluruh body untuk log jika perlu
      raw: status === "SUCCESS" ? "PAID" : status,
    });

    // 3. Respon ke DOKU dengan 200 OK agar mereka berhenti mengirim notifikasi
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
