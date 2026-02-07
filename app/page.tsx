/** biome-ignore-all lint/performance/noImgElement: disable */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: disable */
"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { generateInvoice } from "@/lib/util";

// Product Data
const PRODUCTS = [
  {
    id: "prod-01",
    name: "Smartphone X Pro",
    price: 8500000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    description: "120Hz OLED display with 108MP camera system.",
  },
  {
    id: "prod-02",
    name: "Wireless Noise Cancelling Headphone",
    price: 3200000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    description: "Crystal clear sound with active noise cancellation.",
  },
  {
    id: "prod-03",
    name: "Mechanical Keyboard RGB",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400",
    description: "Tactile blue switches with customizable backlighting.",
  },
  {
    id: "prod-04",
    name: 'UltraWide Monitor 34"',
    price: 5800000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    description: "Enhanced productivity with extra-wide screen real estate.",
  },
];

// Format currency to IDR
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductsPage() {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleBuyNow = async (product: (typeof PRODUCTS)[0]) => {
    try {
      setProcessingId(product.id);

      // Generate unique invoice
      const invoiceId = generateInvoice();

      // Save to Firestore
      await setDoc(doc(db, "INVOICES", invoiceId), {
        invoiceId,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        amount: product.price,
        status: "PENDING",
        createdAt: serverTimestamp(),
        customer: {
          name: "Sabda Works",
          email: "sabdaworks@gmail.com",
        },
      });

      // Redirect to payment page
      router.push(`/payment/${invoiceId}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert(
        "Oops! We're experiencing technical difficulties processing your order. Please try again.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section - Bento Block */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
              Premium Electronics
            </h1>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              Discover cutting-edge technology with secure, fast checkout.
              Quality guaranteed with every purchase.
            </p>
          </div>
        </section>

        {/* Stats Row - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-3xl font-semibold text-gray-900">4</p>
            <p className="text-sm text-gray-500 mt-1">Products Available</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-3xl font-semibold text-gray-900">Secure</p>
            <p className="text-sm text-gray-500 mt-1">Payment Processing</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-3xl font-semibold text-gray-900">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Customer Support</p>
          </div>
        </div>

        {/* Products Grid - Bento Style */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleBuyNow(product)}
                    disabled={processingId !== null}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      processingId === product.id
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                    }`}
                  >
                    {processingId === product.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
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
        </section>

        {/* Trust Badges - Bento Footer */}
        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Verified Products</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
