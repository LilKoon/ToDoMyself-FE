"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserNotificationSettings,
  NotificationLog,
  User,
} from "@/types";
import { notificationApi, authApi } from "@/services/api";

import { Navbar } from "@/components/layout/Navbar";
import { Toast, ToastType } from "@/components/common/Toast";
import {
  Bell,
  Mail,
  Clock,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  History,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import { format, parseISO } from "date-fns";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingDailyDigest, setIsSendingDailyDigest] = useState(false);

  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ isOpen: true, message, type });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated) return;
      try {
        const [settingsData, logsData] = await Promise.all([
          notificationApi.getSettings(),
          notificationApi.getLogs(),
        ]);
        setSettings(settingsData);
        setLogs(logsData);
        if (user) {
          setTimezone(user.timezone || "Asia/Ho_Chi_Minh");
          setFullName(user.full_name || "");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await Promise.all([
        notificationApi.updateSettings({
          email_notifications_enabled: settings.email_notifications_enabled,
          remind_before_minutes: settings.remind_before_minutes,
          daily_summary_enabled: settings.daily_summary_enabled,
          daily_summary_time: settings.daily_summary_time,
        }),
        authApi.updateMe({
          full_name: fullName,
          timezone: timezone,
        }),
      ]);
      await refreshUser();
      showToast("Cập nhật cài đặt thành công!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Không thể lưu cài đặt", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const res = await notificationApi.sendTestEmail();
      showToast(res.message || "Email thử nghiệm đã được gửi thành công!", "success");
      // Reload logs
      const updatedLogs = await notificationApi.getLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Lỗi khi gửi email thử nghiệm", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendDailyDigest = async () => {
    setIsSendingDailyDigest(true);
    try {
      const res = await notificationApi.sendTestDailyDigest();
      showToast(res.message || "Email tổng hợp ngày (Daily Digest) đã được gửi thành công!", "success");
      // Reload logs
      const updatedLogs = await notificationApi.getLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Lỗi khi gửi email tổng hợp ngày", "error");
    } finally {
      setIsSendingDailyDigest(false);
    }
  };

  const timezones = [
    { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (GMT+7 - Asia/Ho_Chi_Minh)" },
    { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
    { value: "Asia/Singapore", label: "Singapore / Malaysia (GMT+8)" },
    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
    { value: "UTC", label: "UTC (GMT+0)" },
    { value: "Europe/London", label: "London (GMT+0 / GMT+1)" },
    { value: "America/New_York", label: "New York (EST/EDT - GMT-5 / -4)" },
    { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT - GMT-8 / -7)" },
  ];

  if (authLoading || isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col">
      <Navbar
        onOpenNewTaskModal={() => router.push("/dashboard")}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb Back */}
        <div className="mb-6 flex items-center gap-3">
          <NextLink
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </NextLink>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Cài Đặt Email & Nhắc Việc
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cấu hình giờ giấc gửi email tự động và múi giờ nhận thông báo qua Resend API
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Test Email Button */}
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Email</span>
                </>
              )}
            </button>

            {/* Test Daily Digest Button */}
            <button
              type="button"
              onClick={handleSendDailyDigest}
              disabled={isSendingDailyDigest}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSendingDailyDigest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi Digest...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thử Gửi Daily Digest</span>
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Section 1: User Profile & Timezone */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thông Tin & Múi Giờ Của Bạn
                </h3>
                <p className="text-xs text-slate-400">
                  Múi giờ đảm bảo email được gửi chính xác vào giờ bạn đặt
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Địa Chỉ Email Nhận Thông Báo
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Múi Giờ Hoạt Động (Timezone)
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Automated Email Settings */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tự Động Gửi Email Nhắc Việc
                </h3>
                <p className="text-xs text-slate-400">
                  Tùy chỉnh lịch gửi email thông báo công việc hàng ngày và trước hạn
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Toggle Master Email */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Bật Nhận Thông Báo Qua Email
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cho phép hệ thống gửi email nhắc nhở theo cài đặt của bạn
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications_enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, email_notifications_enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Remind Before Minutes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Thời Gian Nhắc Trước Deadline Mặc Định
                  </label>
                  <select
                    value={settings.remind_before_minutes}
                    onChange={(e) =>
                      setSettings({ ...settings, remind_before_minutes: parseInt(e.target.value) })
                    }
                    disabled={!settings.email_notifications_enabled}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    <option value={15}>15 phút trước khi đến hạn</option>
                    <option value={30}>30 phút trước khi đến hạn</option>
                    <option value={60}>1 giờ trước khi đến hạn</option>
                    <option value={120}>2 giờ trước khi đến hạn</option>
                    <option value={1440}>1 ngày (24 giờ) trước khi đến hạn</option>
                  </select>
                </div>

                {/* Daily Digest Time */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Giờ Gửi Email Tổng Hợp Buổi Sáng (Daily Digest)
                  </label>
                  <input
                    type="time"
                    value={settings.daily_summary_time}
                    onChange={(e) =>
                      setSettings({ ...settings, daily_summary_time: e.target.value })
                    }
                    disabled={!settings.email_notifications_enabled}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Note on Daily Digest Rules */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Quy Tắc Lọc Công Việc Trong Email Buổi Sáng:
                </p>
                <ul className="list-disc pl-5 space-y-1 opacity-90 text-[11px]">
                  <li>Chỉ gửi các công việc quá hạn chưa xong, công việc trong ngày hôm nay.</li>
                  <li>
                    Chỉ gửi các việc sắp đến hạn trong vòng <strong>1 ngày tới</strong> (due date ≤ 24h).
                  </li>
                  <li>
                    Các việc ở tương lai xa hơn (&gt; 1 ngày) sẽ được giữ lại và chỉ thông báo khi còn 1 ngày đến hạn.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Notification History Logs */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lịch Sử Gửi Email Gần Đây
                </h3>
                <p className="text-xs text-slate-400">
                  Nhật ký các thông báo email đã được gửi từ Resend API
                </p>
              </div>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Chưa có nhật ký thông báo nào. Bấm nút &quot;Gửi Thử Email Ngay&quot; để kiểm tra!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {log.status === "SENT" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.subject}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Đến: {log.recipient_email}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      {format(parseISO(log.sent_at), "dd/MM/yyyy HH:mm:ss")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-500/25 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Đang lưu..." : "Lưu Tất Cả Cài Đặt"}
            </button>
          </div>
        </form>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
