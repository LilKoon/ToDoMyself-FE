"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { magicLogin } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực Magic Link. Vui lòng thử lại từ email.");
      return;
    }

    const processMagicLogin = async () => {
      try {
        await magicLogin(token);
        setStatus("success");
        setTimeout(() => {
          router.replace("/dashboard");
        }, 800);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.detail || "Magic Link đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập bình thường."
        );
      }
    };

    processMagicLogin();
  }, [searchParams, magicLogin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner relative">
              <Loader2 className="w-8 h-8 animate-spin" />
              <Sparkles className="w-4 h-4 absolute top-2 right-2 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Đang Xác Thực Magic Link...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hệ thống đang tự động đăng nhập vào tài khoản của bạn. Vui lòng chờ trong giây lát.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Đăng Nhập Thành Công!
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Đang chuyển hướng thẳng đến Bảng Công Việc...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Không Thể Đăng Nhập
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800/40">
                {errorMessage}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <span>Đi Đến Trang Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <MagicLoginContent />
    </Suspense>
  );
}
