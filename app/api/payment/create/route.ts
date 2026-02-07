import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateSignature, getCurrentTimestamp } from "@/lib/signature";

// Interface untuk payload dari client
interface PaymentRequestBody {
  id: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerId?: string;
  origin: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export async function POST(request: NextRequest) {
  const CLIENT_ID = process.env.DOKU_CLIENT_ID ?? "";
  const SECRET_KEY = process.env.DOKU_SECRET_KEY ?? "";
  const BASE_URL = process.env.DOKU_BASE_URL ?? "https://api-sandbox.doku.com";
  const requestTarget = "/checkout/v1/payment";

  try {
    const body: PaymentRequestBody = await request.json();

    const requestId = uuidv4();
    const requestTimestamp = getCurrentTimestamp();

    const invoiceNumber = `${body.id}-${Date.now()}`;

    // Gunakan invoice number yang unik. DOKU maksimal 64 karakter.
    const jsonBody = {
      order: {
        amount: body.amount,
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: `${body.origin}/payment/${body.id}`,
        callback_url_cancel: `${body.origin}/payment/${body.id}`,
        callback_url_result: `${body.origin}/payment/${body.id}`,
        auto_redirect: true,
        line_items: body.items ?? [],
      },
      payment: {
        payment_due_date: 60,
        payment_method_types: ["CREDIT_CARD"],
      },
      customer: {
        id: body.customerId ?? `CUST-${Date.now()}`,
        name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone,
        address: body.customerAddress,
        country: "ID",
      },
      additional_info: {
        allow_tenor: [0],
        override_notification_url: `${body.origin}/api/payment/notifications`,
      },
    };

    const signature = generateSignature({
      clientId: CLIENT_ID,
      requestId,
      requestTarget,
      requestTimestamp,
      secretKey: SECRET_KEY,
      body: jsonBody,
    });

    const response = await fetch(`${BASE_URL}${requestTarget}`, {
      method: "POST",
      headers: {
        "Client-Id": CLIENT_ID,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Signature: signature,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.error_messages?.[0] ?? "DOKU API Error",
          details: responseData,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: responseData.response?.payment?.url,
      invoiceNumber: invoiceNumber,
      requestId: requestId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Payment creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
