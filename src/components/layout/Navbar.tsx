"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";
import Link from "next/navigation";
import NextLink from "next/link";

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

  useEffect(() => {
    // Check initial dark mode
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Smart Todo Hub
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
              AI & Auto Mail
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
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
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Settings Link */}
          <NextLink
            href="/dashboard/settings"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Cài đặt thông báo Email"
          >
            <Bell className="w-5 h-5 text-indigo-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </NextLink>

          {/* User Profile */}
          {user && (
            <div className="relative">
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
