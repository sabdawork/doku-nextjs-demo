/** biome-ignore-all lint/a11y/noSvgWithoutTitle: disable */
/** biome-ignore-all lint/performance/noImgElement: disable */
"use client";

import { off, onValue, ref } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { db, rtdb } from "@/lib/firebase";
import { getOrigin } from "@/lib/origin";

interface OrderData {
  invoiceId: string;
  amount: number;
  productName: string;
  productImage?: string;
  productDescription?: string;
  paymentUrl?: string;
  customer: {
    name: string;
    email: string;
  };
}

// Format currency to IDR
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PaymentTerminalPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");

  const initializePayment = useCallback(
    async (orderData: OrderData) => {
      try {
        const response = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            amount: orderData.amount,
            customerName: orderData.customer.name,
            customerEmail: orderData.customer.email,
            customerPhone: "628123456789",
            customerAddress: "Customer Address",
            origin: getOrigin(),
            items: [
              {
                name: orderData.productName,
                quantity: 1,
                price: orderData.amount,
              },
            ],
          }),
        });

        const result = await response.json();
        if (result.success && result.paymentUrl) {
          setPaymentUrl(result.paymentUrl);
        } else {
          throw new Error(result.message || "Failed to get payment link");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "API Error occurred");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "INVOICES", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as OrderData;
          setOrder(data);

          if (String(data.paymentUrl || "") === "") {
            initializePayment(data);
          } else {
            setPaymentUrl(data.paymentUrl || "");
          }
        } else {
          setError("Order not found.");
          setLoading(false);
        }
      } catch {
        setError("Failed to fetch data.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, initializePayment]);

  useEffect(() => {
    if (!id) return;
    const statusRef = ref(rtdb, `invoice-status/${id}`);

    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.status) {
        setPaymentStatus(data.status);
      }
    });

    return () => off(statusRef);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-600 animate-pulse">
          Connecting to secure gateway...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Order Details */}
          <section className="lg:col-span-5 space-y-4">
            {/* Back Link */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Store
              </Link>
            </div>

            {/* Product Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img
                  src={
                    order?.productImage ||
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
                  }
                  alt={order?.productName}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mb-3">
                    {id}
                  </span>
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                    {order?.productName}
                  </h1>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {order?.productDescription ||
                    "Complete your payment to receive your order immediately."}
                </p>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(order?.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Customer Details
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {order?.customer.name}
              </p>
              <p className="text-sm text-gray-500">{order?.customer.email}</p>
            </div>

            {/* View Invoice Button */}
            <Link
              href={`/invoice/${id}`}
              className="flex items-center justify-center w-full py-4 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.98] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              View Invoice
            </Link>
          </section>

          {/* Right Column - Payment Gateway */}
          <section className="lg:col-span-7">
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 h-full min-h-[600px] relative">
              {paymentStatus === "SUCCESS" ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="max-w-md w-full text-center space-y-6">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Payment Successful!
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Thank you! Your transaction has been received and your
                        order is being processed.
                      </p>
                    </div>

                    {/* Transaction Summary */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Invoice Number</span>
                        <span className="text-gray-900 font-mono font-medium">
                          {id}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="text-gray-900">Secure Gateway</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-gray-900 font-medium">
                          Total Paid
                        </span>
                        <span className="text-green-600 font-bold text-lg">
                          {formatPrice(order?.amount || 0)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400">
                      Confirmation sent to{" "}
                      <span className="text-gray-600 font-medium">
                        {order?.customer.email}
                      </span>
                    </p>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : paymentUrl ? (
                <iframe
                  src={paymentUrl}
                  title="Payment Gateway"
                  className="w-full h-full min-h-150 border-none"
                  allow="payment"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 animate-pulse">
                      Loading payment link...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
