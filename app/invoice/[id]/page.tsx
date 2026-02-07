"use client";

import { doc, getDoc } from "firebase/firestore";
import { DateTime } from "luxon";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface OrderData {
  invoiceId: string;
  amount: number;
  productName: string;
  // biome-ignore lint/suspicious/noExplicitAny: disable
  createdAt: any;
  customer: {
    name: string;
    email: string;
  };
}

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

  if (loading)
    return <div className="p-10 text-center">Loading Invoice...</div>;
  if (!order)
    return <div className="p-10 text-center">Invoice tidak ditemukan.</div>;

  const date = order.createdAt?.seconds
    ? DateTime.fromSeconds(order.createdAt.seconds)
        .setZone("Asia/Makassar")
        .toFormat("dd LLL yyyy, HH:mm")
    : DateTime.now().toFormat("dd LLL yyyy");

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      {/* Tombol Aksi - Disembunyikan saat cetak */}
      <div className="w-full max-w-3xl mb-6 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold text-gray-800">Preview Invoice</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-5 py-2 rounded font-bold shadow-lg hover:bg-blue-700 transition"
        >
          Cetak ke PDF
        </button>
      </div>

      {/* Kertas Invoice */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-sm p-8 sm:p-16 print:shadow-none print:p-0">
        {/* Header Invoice */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="text-3xl font-black text-blue-600 tracking-tighter mb-1">
              TECHSTORE<span className="text-gray-900">.</span>
            </div>
            <p className="text-gray-500 text-sm">
              Gadget & Electronics Division
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest mb-2">
              Invoice
            </h2>
            <p className="font-bold text-gray-800">{order.invoiceId}</p>
          </div>
        </div>

        {/* Info Alamat */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Diterbitkan Oleh
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">TechStore Indonesia</p>
              <p>Jl. Jenderal Sudirman No. 45</p>
              <p>Jakarta Selatan, 12190</p>
              <p>support@techstore.id</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Ditujukan Untuk
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">{order.customer.name}</p>
              <p>{order.customer.email}</p>
              <p>
                Status: <span className="text-green-600 font-bold">LUNAS</span>
              </p>
              <p>Tanggal: {date} WITA</p>
            </div>
          </div>
        </div>

        {/* Tabel Produk */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-100 text-left">
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Deskripsi Produk
              </th>
              <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Harga
              </th>
              <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-6">
                <p className="font-bold text-gray-900">{order.productName}</p>
                <p className="text-xs text-gray-500">
                  Elektronik - Garansi Resmi 1 Tahun
                </p>
              </td>
              <td className="py-6 text-right text-sm text-gray-600">
                Rp {order.amount.toLocaleString("id-ID")}
              </td>
              <td className="py-6 text-right text-sm text-gray-600">1</td>
              <td className="py-6 text-right font-bold text-gray-900">
                Rp {order.amount.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer & Total */}
        <div className="flex justify-between items-center">
          <div className="w-1/2">
            <p className="text-xs text-gray-400 italic">
              *Invoice ini adalah bukti pembayaran yang sah dan dihasilkan
              secara otomatis oleh sistem.
            </p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-sm">Subtotal</span>
              <span className="text-gray-900 text-sm font-bold">
                Rp {order.amount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between mb-4 pb-4 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Pajak (0%)</span>
              <span className="text-gray-900 text-sm font-bold">Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900 font-bold uppercase tracking-wider">
                Total Akhir
              </span>
              <span className="text-blue-600 text-xl font-black">
                Rp {order.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Digital */}
        <div className="mt-20 flex justify-end">
          <div className="text-center w-48">
            <div className="h-1 bg-gray-900 mb-4"></div>
            <p className="text-xs font-bold text-gray-900 uppercase">
              TechStore Official
            </p>
            <p className="text-[10px] text-gray-400">Digital Signed Document</p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-gray-400 text-xs print:hidden">
        &copy; 2026 TechStore Indonesia. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
