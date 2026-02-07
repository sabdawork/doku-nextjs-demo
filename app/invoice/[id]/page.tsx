/** biome-ignore-all lint/a11y/noSvgWithoutTitle: disable */
"use client";

import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { DateTime } from "luxon";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface OrderData {
  invoiceId: string;
  amount: number;
  productName: string;
  createdAt: Timestamp;
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

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "INVOICES", id.split("-").slice(0, 3).join("-"));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data() as OrderData);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            The requested invoice could not be located in our system.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Return to Store
          </a>
        </div>
      </div>
    );
  }

  const date = order.createdAt?.seconds
    ? DateTime.fromSeconds(order.createdAt.seconds)
        .setZone("Asia/Makassar")
        .toFormat("dd LLL yyyy, HH:mm")
    : DateTime.now().toFormat("dd LLL yyyy");

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Action Bar - Hidden when printing */}
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Invoice Preview
              </h1>
              <p className="text-xs text-gray-500">{order.invoiceId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 py-3 px-5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.98] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print PDF
          </button>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 sm:p-12 lg:p-16 space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                  TechStore
                </div>
                <p className="text-sm text-gray-500">
                  Gadget & Electronics Division
                </p>
              </div>
              <div className="sm:text-right">
                <h2 className="text-3xl font-light text-gray-300 uppercase tracking-widest mb-2">
                  Invoice
                </h2>
                <p className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                  {order.invoiceId}
                </p>
              </div>
            </div>

            {/* Info Grid - Bento Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Issued By
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">
                    TechStore Indonesia
                  </p>
                  <p>Jl. Jenderal Sudirman No. 45</p>
                  <p>Jakarta Selatan, 12190</p>
                  <p className="text-gray-500">support@techstore.id</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Bill To
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">
                    {order.customer.name}
                  </p>
                  <p className="text-gray-500">{order.customer.email}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    PAID
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-xs font-medium text-gray-700">
                    {date} WITA
                  </span>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Product Description
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50 last:border-b-0">
                    <td className="py-6 px-6">
                      <p className="font-medium text-gray-900">
                        {order.productName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Electronics - 1 Year Official Warranty
                      </p>
                    </td>
                    <td className="py-6 px-6 text-right text-sm text-gray-600">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="py-6 px-6 text-right text-sm text-gray-600">
                      1
                    </td>
                    <td className="py-6 px-6 text-right font-semibold text-gray-900">
                      {formatPrice(order.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
              <div className="max-w-sm">
                <p className="text-xs text-gray-400 leading-relaxed">
                  *This invoice is a valid proof of payment and was
                  automatically generated by the system.
                </p>
              </div>
              <div className="w-full sm:w-72 bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium">
                    {formatPrice(order.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (0%)</span>
                  <span className="text-gray-900 font-medium">IDR 0</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(order.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-xs py-4 print:hidden">
          &copy; 2026 TechStore Indonesia. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
