import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SetPasswordModal } from "@/components/auth/SetPasswordModal";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Smart Todo Hub — Quản Lý Công Việc & Nhắc Nhở Email Tự Động",
  description: "Ứng dụng Todo thông minh với FastAPI, Next.js, JWT Auth, Google Sign-in và hệ thống tự động gửi email nhắc việc theo giờ cài đặt.",
};

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "317892572328-n1ffga8kmk8eb6u2s00so1c5olap8arm.apps.googleusercontent.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-slate-50 dark:bg-[#090d16]`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            {children}
            <SetPasswordModal />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
