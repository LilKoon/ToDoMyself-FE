"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Sparkles,
  BellRing,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
  Zap,
  MailCheck,
} from "lucide-react";
import NextLink from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <CheckSquare className="w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
            Smart Todo Hub
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NextLink
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Đăng Nhập
          </NextLink>
          <NextLink
            href="/register"
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition"
          >
            Bắt Đầu Miễn Phí
          </NextLink>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 animate-pulse-subtle">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Hệ thống nhắc việc tự động qua Email & Quản lý thông minh</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl">
          Làm Việc Năng Suất Hơn với{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
            Smart Todo & Auto Mail
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Tối ưu hóa thời gian với bảng Kanban, lịch thông minh và hệ thống tự động gửi email nhắc nhở theo giờ giấc, múi giờ riêng của bạn.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <NextLink
            href="/register"
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition transform hover:-translate-y-0.5 cursor-pointer text-base"
          >
            <span>Trải Nghiệm Ngay</span>
            <ArrowRight className="w-5 h-5" />
          </NextLink>
          <NextLink
            href="/login"
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-base"
          >
            Đăng Nhập Tài Khoản
          </NextLink>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <MailCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Auto Mail Thông Minh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Nhận email báo công việc trước 1 ngày hoặc đúng giờ hẹn, kèm Daily digest tổng kết buổi sáng qua Resend API.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Đa Góc Nhìn Linh Hoạt
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tùy biến góc nhìn theo Danh sách, Kanban kéo thả hoặc Lịch tháng trực quan theo nhu cầu của bạn.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Bảo Mật JWT & Google OAuth
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Xác thực an toàn với JWT token, tích hợp đăng nhập Google One-Tap và cơ chế bắt buộc mật khẩu nâng cao.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>© 2026 Smart Todo Hub. Fullstack FastAPI + Next.js + PostgreSQL.</p>
      </footer>
    </div>
  );
}
