export const getOrigin = (): string => {
  // 1. Cek jika berjalan di browser
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 2. Fallback untuk Server-Side (SSR/Metadata)
  // Vercel menyediakan URL otomatis di process.env.VERCEL_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Default fallback (local development)
  return "http://localhost:3000";
};
