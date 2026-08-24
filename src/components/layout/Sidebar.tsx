"use client";

import React from "react";
import {
  ListTodo,
  Calendar,
  Columns,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle,
  FolderOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

export type ViewMode = "list" | "kanban" | "calendar";

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  stats?: {
    overdue: number;
    dueToday: number;
    upcoming24h: number;
    total: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
  activeCategory,
  onCategoryChange,
  stats,
}) => {
  const pathname = usePathname();
  const isSettings = pathname === "/dashboard/settings";

  const categories = ["All", "General", "Work", "Personal", "Study", "Project"];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6">
      {/* View Switcher Tabs */}
      <div className="glass-panel p-1.5 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
            viewMode === "list"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Danh Sách</span>
        </button>

        <button
          onClick={() => onViewModeChange("kanban")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
            viewMode === "kanban"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>Kanban</span>
        </button>

        <button
          onClick={() => onViewModeChange("calendar")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
            viewMode === "calendar"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch</span>
        </button>
      </div>

      {/* Main Filter Navigation */}
      <div className="glass-card rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5">
          Góc Nhìn Công Việc
        </div>
        <div className="space-y-1 mt-1">
          <button
            onClick={() => onFilterChange("all")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeFilter === "all"
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-slate-400" />
              <span>Tất Cả Việc</span>
            </div>
            {stats && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {stats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange("today")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeFilter === "today"
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Hôm Nay</span>
            </div>
            {stats && stats.dueToday > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                {stats.dueToday}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange("upcoming")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeFilter === "upcoming"
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Sắp Tới (Trong 24h)</span>
            </div>
            {stats && stats.upcoming24h > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
                {stats.upcoming24h}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange("overdue")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeFilter === "overdue"
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Quá Hạn</span>
            </div>
            {stats && stats.overdue > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                {stats.overdue}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange("completed")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeFilter === "completed"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Đã Hoàn Thành</span>
            </div>
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Danh Mục
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat === "All" ? "Tất Cả" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Navigation Link */}
      <NextLink
        href="/dashboard/settings"
        className={`glass-card rounded-2xl p-3.5 flex items-center justify-between border transition ${
          isSettings
            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
            : "border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Cài Đặt Email</div>
            <div className="text-xs text-slate-400">Giờ giấc & Nhắc nhở</div>
          </div>
        </div>
      </NextLink>
    </aside>
  );
};
