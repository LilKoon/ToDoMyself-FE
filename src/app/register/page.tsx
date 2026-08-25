"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import {
  CheckSquare,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import NextLink from "next/link";

export default function RegisterPage() {
  const { sendRegisterOTP, verifyRegisterOTP, resendRegisterOTP, googleLogin, isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // Form states
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [expirySeconds, setExpirySeconds] = useState<number>(300); // 5 minutes = 300s
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 1 minute = 60s
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Status & feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("todo_access_token");
      if (token || isAuthenticated) {
        router.replace("/dashboard");
        return;
      }
    }
    if (!isLoading && !isAuthenticated) {
      setIsReady(true);
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Expiry Timer (5 minutes) & Resend Cooldown (60 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "OTP") {
      interval = setInterval(() => {
        setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Submit Form to Send OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendRegisterOTP(email.trim(), fullName.trim(), password);
      setStep("OTP");
      setExpirySeconds(res.expires_in_seconds || 300);
      setResendCooldown(res.cooldown_seconds || 60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage(res.message || `Mã OTP đã được gửi tới ${email}.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Không thể gửi mã xác thực OTP. Vui lòng kiểm tra lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle OTP input typing and pasting
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, ""); // Only numbers
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    // Single digit entry
    const char = cleanVal[cleanVal.length - 1];
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    // Auto-advance to next input
    if (index < 5 && char) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || "";
      }
      setOtpDigits(updated);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    if (expirySeconds <= 0) {
      setError("Mã OTP đã hết hạn. Vui lòng bấm 'Gửi lại mã OTP'.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await verifyRegisterOTP(email.trim(), otpCode);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mã OTP không chính xác hoặc đã hết hạn.");
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const res = await resendRegisterOTP(email.trim());
      setExpirySeconds(res.expires_in_seconds || 300);
      setResendCooldown(res.cooldown_seconds || 60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage(res.message || "Đã gửi lại mã OTP mới.");
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setError(null);
      setIsSubmitting(true);
      try {
        await googleLogin(credentialResponse.credential);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Đăng nhập bằng Google thất bại.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isReady || isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#090d16]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <NextLink href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <CheckSquare className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Smart Todo Hub
            </span>
          </NextLink>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === "FORM" ? "Tạo Tài Khoản Mới" : "Xác Thực Email Đăng Ký"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === "FORM"
              ? "Bắt đầu quản lý công việc và nhận email thông báo tự động."
              : `Nhập mã xác thực OTP 6 số đã được gửi tới hộp thư của bạn.`}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === "FORM" && (
          <div>
            {/* Google OAuth Button */}
            <div className="mb-6 flex flex-col items-center">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Đăng nhập Google thất bại")}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="signup_with"
                  locale="vi"
                  useOneTap={false}
                  auto_select={false}
                />
              </div>
              <div className="w-full flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Hoặc điền thông tin</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Họ và Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm font-medium"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Mật khẩu (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
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
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp Tục Xác Thực Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION SCREEN */}
        {step === "OTP" && (
          <div className="space-y-6 animate-fade-in">
            {/* Email recipient banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-center">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                Mã xác thực gửi tới:
              </span>
              <div className="text-sm font-black text-indigo-950 dark:text-indigo-100 truncate mt-0.5">
                {email}
              </div>
            </div>

            {/* 6 Digit Input Boxes */}
            <div>
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Nhập 6 Chữ Số Mã OTP
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition selection:bg-transparent"
                  />
                ))}
              </div>
            </div>

            {/* 5-Minute Expiry Countdown */}
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Hiệu lực mã:</span>
              </div>
              <span className={`font-mono font-bold ${expirySeconds < 60 ? "text-rose-600 animate-pulse" : "text-indigo-600 dark:text-indigo-400"}`}>
                {formatTime(expirySeconds)}
              </span>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isSubmitting || otpDigits.join("").length !== 6 || expirySeconds <= 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực tài khoản...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xác Nhận & Hoàn Tất Đăng Ký</span>
                </>
              )}
            </button>

            {/* Resend OTP Button with 60s cooldown */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className={`text-xs font-semibold flex items-center gap-1.5 transition ${
                  resendCooldown > 0
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                }`}
              >
                {isResending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Gửi lại mã OTP sau (${resendCooldown}s)`
                    : "Gửi lại mã OTP"}
                </span>
              </button>
            </div>

            {/* Back to Edit Form */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("FORM");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Nhập sai email? Quay lại chỉnh sửa</span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <NextLink
            href="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Đăng nhập ngay
          </NextLink>
        </p>
      </div>
    </div>
  );
}
