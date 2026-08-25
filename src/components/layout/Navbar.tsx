"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { NotificationLog } from "@/types";
import { notificationApi } from "@/services/api";
import {
  CheckSquare,
  Moon,
  Sun,
  LogOut,
  Bell,
  Search,
  Plus,
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox,
  RefreshCw,
} from "lucide-react";
import NextLink from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface NavbarProps {
  onOpenNewTaskModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTaskModal,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notification logs
  const fetchNotificationLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await notificationApi.getLogs();
      setNotificationLogs(logs || []);
    } catch (e) {
      console.error("Failed to load notification logs", e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchNotificationLogs();
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotificationDropdown) {
      fetchNotificationLogs();
      setHasUnread(false);
    }
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo (Clickable to Dashboard) */}
        <NextLink
          href="/dashboard"
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition select-none"
          title="Quay về trang chính Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition duration-200">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Smart Todo Hub
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
              AI & Auto Mail
            </span>
          </div>
        </NextLink>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm công việc, danh mục hoặc ghi chú..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
            />
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Task */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo Việc Mới</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notification Popover Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl transition relative cursor-pointer ${
                showNotificationDropdown
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Thông báo hệ thống & Email nhắc việc"
            >
              <Bell className="w-5 h-5 text-indigo-500" />
              {hasUnread && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                </>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-fade-in flex flex-col">
                {/* Popover Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <MailCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Thông Báo & Email</h4>
                  </div>
                  <button
                    onClick={fetchNotificationLogs}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                    title="Làm mới"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Popover Content */}
                <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoadingLogs ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Đang tải thông báo...</span>
                    </div>
                  ) : notificationLogs.length === 0 ? (
                    <div className="py-10 px-4 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chưa có thông báo nào</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                        Hệ thống sẽ gửi email và ghi nhật ký nhắc nhở khi đến hạn công việc.
                      </p>
                    </div>
                  ) : (
                    notificationLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex items-start gap-3"
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          log.status === "SENT"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {log.status === "SENT" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              {log.notification_type === "TASK_REMINDER"
                                ? "Nhắc nhở hẹn giờ"
                                : log.notification_type === "DUE_SOON"
                                ? "Sắp đến hạn"
                                : log.notification_type === "DAILY_DIGEST"
                                ? "Tổng kết buổi sáng"
                                : "Email thông báo"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDistanceToNow(parseISO(log.sent_at), { addSuffix: true, locale: vi })}
                            </span>
                          </div>


                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-2">
                            {log.subject || `Đã gửi email tới ${log.recipient_email}`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                  <NextLink
                    href="/dashboard/settings"
                    onClick={() => setShowNotificationDropdown(false)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 py-1"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Cài đặt giờ giấc & Email thông báo</span>
                  </NextLink>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {user && (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.full_name}
                </span>
              </button>

              {/* Dropdown menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-500">
                      <Clock className="w-3 h-3" />
                      <span>{user.timezone || "Asia/Ho_Chi_Minh"}</span>
                    </div>
                  </div>

                  <NextLink
                    href="/dashboard/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Cài Đặt Email & Nhắc Nhở</span>
                  </NextLink>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
