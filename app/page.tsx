"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { generateInvoice } from "@/lib/util";

// Dummy Data Elektronik
const PRODUCTS = [
  {
    id: "prod-01",
    name: "Smartphone X Pro",
    price: 8500000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    description: "Layar OLED 120Hz dengan kamera 108MP.",
  },
  {
    id: "prod-02",
    name: "Wireless Noise Cancelling Headphone",
    price: 3200000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    description: "Suara jernih dengan fitur pembatal bising aktif.",
  },
  {
    id: "prod-03",
    name: "Mechanical Keyboard RGB",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400",
    description: "Switch biru yang taktil dan lampu latar kustom.",
  },
  {
    id: "prod-04",
    name: 'UltraWide Monitor 34"',
    price: 5800000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    description: "Produktivitas meningkat dengan layar ekstra lebar.",
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleBuyNow = async (product: (typeof PRODUCTS)[0]) => {
    try {
      setProcessingId(product.id);

      // 1. Generate Invoice Unik
      const invoiceId = generateInvoice();

      // 2. Simpan Data ke Firestore
      // Kita gunakan invoiceId sebagai ID dokumen agar mudah dicari nantinya
      await setDoc(doc(db, "INVOICES", invoiceId), {
        invoiceId: invoiceId,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        amount: product.price,
        status: "PENDING",
        createdAt: serverTimestamp(),
        // Data dummy customer (bisa diambil dari session/auth nantinya)
        customer: {
          name: "Sabda Works",
          email: "sabdaworks@gmail.com",
        },
      });

      // 3. Redirect ke halaman pembayaran
      router.push(`/payment/${invoiceId}`);
    } catch (error) {
      console.error("Gagal membuat pesanan:", error);
      alert(
        "Waduh, ada masalah teknis saat memproses pesananmu. Coba lagi ya!",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Gadget & Elektronik
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Temukan teknologi impianmu di sini. Cepat, aman, dan bergaransi.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-200">
                {/** biome-ignore lint/performance/noImgElement: disable */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {product.description}
                </p>

                <div className="mt-auto">
                  <p className="text-2xl font-black text-blue-600 mb-4">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleBuyNow(product)}
                    disabled={processingId !== null}
                    className={`w-full py-3 rounded-xl font-bold transition-colors cursor-pointer ${
                      processingId === product.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    {processingId === product.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { DateTime } from "luxon";
// import { useRouter } from "next/navigation";
// import { type ChangeEvent, useState } from "react";
// import { getOrigin } from "@/lib/origin";

// interface PaymentData {
//   amount: number;
//   customerName: string;
//   customerEmail: string;
//   customerPhone: string;
//   customerAddress: string;
// }

// export default function PaymentPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
//   const [paymentData, setPaymentData] = useState<PaymentData>({
//     amount: 100000,
//     customerName: "John Doe",
//     customerEmail: "john@example.com",
//     customerPhone: "6281234567890",
//     customerAddress: "Jl. Contoh No. 123",
//   });

//   const createPayment = async () => {
//     try {
//       setLoading(true);

//       const origin = getOrigin();
//       const timestamp = DateTime.now().toFormat("yyyyMMddHHmmss");
//       const customerId = `CUST-${timestamp}`;

//       const response = await fetch("/api/payment/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...paymentData,
//           customerId,
//           origin,
//           items: [
//             {
//               name: "Produk Premium",
//               quantity: 1,
//               price: paymentData.amount,
//             },
//           ],
//         }),
//       });

//       const result = await response.json();
//       if (result.success && result.paymentUrl) {
//         // Alih-alih window.open, kita simpan URL-nya ke state
//         setPaymentUrl(result.paymentUrl);
//       } else {
//         throw new Error(result.message || "Gagal membuat pembayaran");
//       }
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Terjadi kesalahan";
//       alert(`Error: ${errorMessage}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPaymentData((prev) => ({
//       ...prev,
//       [name]: name === "amount" ? Number.parseInt(value, 10) || 0 : value,
//     }));
//   };

//   const closeIframe = () => {
//     setPaymentUrl(null);
//     // Opsional: Arahkan ke halaman status untuk cek pembayaran terakhir
//     router.push("/payment/status");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8">
//       {/* Modal Iframe */}
//       {paymentUrl && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h2 className="font-bold text-gray-800">Pembayaran Aman</h2>
//               <button
//                 type="button"
//                 onClick={closeIframe}
//                 className="text-gray-500 hover:text-gray-700 p-2"
//                 aria-label="Tutup Pembayaran"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   role="img"
//                   aria-labelledby="closeIconTitle"
//                 >
//                   <title id="closeIconTitle">Close Icon</title>
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <iframe
//               src={paymentUrl}
//               title="DOKU Payment Terminal"
//               className="flex-1 w-full h-full border-none"
//               allow="payment"
//             />
//           </div>
//         </div>
//       )}

//       <div className="max-w-md mx-auto mt-8 md:mt-12">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <header className="text-center mb-8">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
//               Checkout Payment
//             </h1>
//             <p className="text-gray-600">Secure payment via DOKU</p>
//           </header>

//           <section className="bg-gray-50 rounded-xl p-4 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="font-semibold text-gray-800">Produk Premium</h2>
//                 <p className="text-sm text-gray-600">1 item</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-lg font-bold text-blue-600">
//                   Rp {paymentData.amount.toLocaleString("id-ID")}
//                 </p>
//               </div>
//             </div>
//             <div className="border-t pt-4">
//               <div className="flex justify-between text-gray-800">
//                 <span className="font-medium">Total Tagihan</span>
//                 <span className="font-bold text-xl">
//                   Rp {paymentData.amount.toLocaleString("id-ID")}
//                 </span>
//               </div>
//             </div>
//           </section>

//           <form className="space-y-4 mb-8" onSubmit={(e) => e.preventDefault()}>
//             <h3 className="font-semibold text-gray-800 mb-4">
//               Informasi Pelanggan
//             </h3>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="customerName"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Nama Lengkap
//               </label>
//               <input
//                 id="customerName"
//                 type="text"
//                 name="customerName"
//                 value={paymentData.customerName}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
//                 placeholder="Masukkan nama"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="customerEmail"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Email
//               </label>
//               <input
//                 id="customerEmail"
//                 type="email"
//                 name="customerEmail"
//                 value={paymentData.customerEmail}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
//                 placeholder="email@contoh.com"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="customerPhone"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Nomor Telepon
//               </label>
//               <input
//                 id="customerPhone"
//                 type="tel"
//                 name="customerPhone"
//                 value={paymentData.customerPhone}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
//                 placeholder="Contoh: 62812..."
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="amount"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Jumlah Pembayaran (IDR)
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
//                   Rp
//                 </span>
//                 <input
//                   id="amount"
//                   type="number"
//                   name="amount"
//                   value={paymentData.amount}
//                   onChange={handleInputChange}
//                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   min="10000"
//                 />
//               </div>
//             </div>
//           </form>

//           <button
//             type="button"
//             onClick={createPayment}
//             disabled={loading || paymentData.amount < 10000}
//             className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
//               loading || paymentData.amount < 10000
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
//             }`}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center">
//                 <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
//                 Memproses...
//               </span>
//             ) : (
//               `Bayar Rp ${paymentData.amount.toLocaleString("id-ID")}`
//             )}
//           </button>

//           <footer className="mt-6 pt-6 border-t border-gray-100">
//             <div className="flex items-center justify-center text-sm text-gray-500">
//               <svg
//                 className="w-4 h-4 mr-2"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//                 role="img"
//                 aria-labelledby="lockTitle"
//               >
//                 <title id="lockTitle">Secure Icon</title>
//                 <path
//                   fillRule="evenodd"
//                   d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               Pembayaran aman melalui DOKU
//             </div>
//           </footer>
//         </div>

//         <aside className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
//           <div className="flex items-start">
//             <svg
//               className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//               role="img"
//               aria-labelledby="infoTitle"
//             >
//               <title id="infoTitle">Info Icon</title>
//               <path
//                 fillRule="evenodd"
//                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <div className="ml-3">
//               <h4 className="text-sm font-medium text-amber-800">
//                 Demo Information
//               </h4>
//               <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
//                 <li>Minimal nominal: Rp 10.000</li>
//                 <li>Format telepon: 628xxxxxxxxxx</li>
//                 <li>Pembayaran akan muncul langsung di layar ini</li>
//               </ul>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }
