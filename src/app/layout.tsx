import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { SessionGuard } from "@/components/auth/session-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: "건물정보 관리",
  description: "경주 지역 인터넷 현장기사 건물정보 관리 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "건물정보",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased">
        {children}
        <SessionGuard />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: { fontSize: '14px', marginTop: '8px' },
          }}
        />
      </body>
    </html>
  );
}
