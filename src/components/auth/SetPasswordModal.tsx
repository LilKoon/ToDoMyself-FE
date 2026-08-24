"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export const SetPasswordModal: React.FC = () => {
  const { needsPasswordSetup, pendingUser, completePasswordSetup, closePasswordSetupModal } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!needsPasswordSetup) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng nhập lại.");
      return;
    }

    setIsSubmitting(true);
    try {
      await completePasswordSetup(password);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Đã xảy ra lỗi khi tạo mật khẩu. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Glow Header */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Thiết Lập Mật Khẩu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Chào mừng <strong className="text-slate-700 dark:text-slate-200">{pendingUser?.email}</strong>!
            Để bảo mật tài khoản khi đăng nhập Google lần đầu, bạn bắt buộc phải tạo mật khẩu để tiếp tục.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Mật khẩu mới (Tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu bảo vệ..."
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận & Vào Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={closePasswordSetupModal}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            Hủy và quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
