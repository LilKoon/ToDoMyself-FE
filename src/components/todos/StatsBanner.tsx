"use client";

import React from "react";
import { TodoStats } from "@/types";
import { CheckCircle2, Clock, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

interface StatsBannerProps {
  stats: TodoStats | null;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total & Completion Rate */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tiến Độ Tổng
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.completion_rate}%
          </span>
          <span className="text-xs text-slate-400">
            ({stats.completed_todos}/{stats.total_todos} việc)
          </span>
        </div>
        <div className="mt-3 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${stats.completion_rate}%` }}
          />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hôm Nay Cần Làm
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.due_today_todos}
          </span>
          <span className="text-xs text-slate-400">công việc</span>
        </div>
        <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-2 font-medium">
          Được gửi trong email sáng nay
        </p>
      </div>

      {/* Upcoming in 24h */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sắp Đến Hạn (24h)
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.upcoming_24h_todos}
          </span>
          <span className="text-xs text-slate-400">công việc</span>
        </div>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
          Đã kích hoạt chế độ báo trước 1 ngày
        </p>
      </div>

      {/* Overdue */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quá Hạn Chưa Xong
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-black ${stats.overdue_todos > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
            {stats.overdue_todos}
          </span>
          <span className="text-xs text-slate-400">việc cần xử lý gấp</span>
        </div>
        <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-2 font-medium">
          {stats.overdue_todos > 0 ? "Ưu tiên giải quyết ngay" : "Không có việc quá hạn 🎉"}
        </p>
      </div>
    </div>
  );
};
