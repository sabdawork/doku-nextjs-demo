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
  productImage?: string; // Tambahkan ini di Firestore saat simpan pesanan
  productDescription?: string;
  customer: {
    name: string;
    email: string;
  };
}

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
            customerAddress: "Alamat Pelanggan",
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
          throw new Error(
            result.message || "Gagal mendapatkan link pembayaran",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan API");
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
          initializePayment(data);
        } else {
          setError("Pesanan tidak ditemukan.");
          setLoading(false);
        }
        // biome-ignore lint/correctness/noUnusedVariables: disable
      } catch (err) {
        setError("Gagal mengambil data.");
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">
          Menghubungkan ke secure gateway...
        </p>
      </div>
    );

  if (error) return <div className="p-10 text-center">{error}</div>;

  return (
    <div className="min-h-screen container mx-auto py-20">
      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="w-full p-4 rounded-lg border border-neutral-200">
          <Link
            href={"/"}
            className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-800 transition"
          >
            ← Kembali
          </Link>

          <div className="mb-6 aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
            {/** biome-ignore lint/performance/noImgElement: <img> */}
            <img
              src={
                order?.productImage ||
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
              }
              alt={order?.productName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {id}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3">
                {order?.productName}
              </h1>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {order?.productDescription ||
                "Lengkapi pembayaran Anda untuk segera mendapatkan produk impian ini."}
            </p>

            <hr className="border-gray-100" />

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Total Tagihan</span>
              <span className="text-xl font-black text-gray-900">
                Rp {order?.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
              Customer
            </h4>
            <p className="text-sm font-semibold text-slate-700">
              {order?.customer.name}
            </p>
            <p className="text-xs text-slate-500">{order?.customer.email}</p>
          </div>

          <hr className="border-gray-100" />
          <Link
            href={`/invoice/${id}`}
            className="bg-blue-600 text-white px-5 py-2 rounded font-bold shadow-lg hover:bg-blue-700 transition w-full"
          >
            View Invoice
          </Link>
        </section>

        <section className="w-full relative rounded-lg overflow-hidden">
          {paymentStatus === "SUCCESS" ? (
            <div className="bg-white flex items-center justify-center px-6 py-20 lg:py-40">
              <div className="max-w-md w-full text-center">
                {/* Teks Utama */}
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Pembayaran Berhasil!
                </h2>
                <p className="text-gray-500 mb-8">
                  Terima kasih! Transaksi Anda telah kami terima dan pesanan
                  sedang diproses.
                </p>

                {/* Ringkasan Transaksi Mini */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-400 text-sm">No. Invoice</span>
                    <span className="text-gray-800 font-mono text-sm font-bold">
                      {id}
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-400 text-sm">Metode Bayar</span>
                    <span className="text-gray-800 text-sm">DOKU Payment</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-bold">Total Lunas</span>
                    <span className="text-green-600 font-black text-lg">
                      Rp {order?.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <p className="mt-8 text-xs text-gray-400">
                  Konfirmasi telah dikirim ke{" "}
                  <span className="text-gray-600 font-medium">
                    {order?.customer.email}
                  </span>
                </p>
              </div>
            </div>
          ) : paymentUrl ? (
            <iframe
              src={paymentUrl}
              title="Payment Gateway"
              className="w-full h-full border-none"
              allow="payment"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 animate-pulse">
                Memuat link pembayaran...
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
