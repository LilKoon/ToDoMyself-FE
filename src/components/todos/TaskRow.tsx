"use client";

import React, { useState } from "react";
import { Todo, Priority, Status } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  ListCheck,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  CheckSquare2,
  Plus,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import confetti from "canvas-confetti";

interface TaskRowProps {
  todo: Todo;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  todo,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}) => {
  const isCompleted = todo.status === "COMPLETED";

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: Status = isCompleted ? "TODO" : "COMPLETED";
    if (nextStatus === "COMPLETED") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onStatusChange(todo.id, nextStatus);
  };

  const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
    URGENT: { label: "Khẩn Cấp", badge: "badge-urgent", dot: "bg-rose-500" },
    HIGH: { label: "Quan Trọng", badge: "badge-high", dot: "bg-amber-500" },
    MEDIUM: { label: "Trung Bình", badge: "badge-medium", dot: "bg-indigo-500" },
    LOW: { label: "Thấp", badge: "badge-low", dot: "bg-slate-400" },
  };

  let dueDateText = "";
  let isOverdue = false;
  if (todo.due_date) {
    try {
      const d = parseISO(todo.due_date);
      isOverdue = isPast(d) && !isToday(d) && !isCompleted;
      if (isOverdue) {
        dueDateText = `Quá hạn (${format(d, "dd/MM")})`;
      } else if (isToday(d)) {
        dueDateText = `Hôm nay ${format(d, "HH:mm")}`;
      } else if (isTomorrow(d)) {
        dueDateText = `Ngày mai ${format(d, "HH:mm")}`;
      } else {
        dueDateText = format(d, "dd/MM/yyyy");
      }
    } catch {
      dueDateText = "";
    }
  }

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-70"
          : isOverdue
          ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50 shadow-xs"
          : isExpanded
          ? "bg-white dark:bg-slate-900 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/20"
          : "bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-md"
      }`}
    >
      {/* Main Clickable Row Header */}
      <div
        onClick={onToggleExpand}
        className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
      >
        {/* Left: Checkbox + Content (Title on Line 1, Meta Chips on Line 2 for Mobile) */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`p-1 rounded-lg transition flex-shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${
              isCompleted
                ? "text-emerald-500 hover:text-emerald-600"
                : "text-slate-400 hover:text-indigo-600"
            }`}
            title={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/10 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Content Container */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            {/* TIER 1 (Desktop Inline / Mobile Top): Priority + Category + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Priority Badge on Desktop */}
              <span
                className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
                  priorityStyles[todo.priority]?.badge
                }`}
              >
                {priorityStyles[todo.priority]?.label}
              </span>

              {/* Category Pill on Desktop */}
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                📁 {todo.category}
              </span>

              {/* Task Title (Takes 100% width on mobile, full text visible) */}
              <span
                className={`text-sm font-bold text-slate-900 dark:text-white tracking-tight break-words sm:truncate flex-1 ${
                  isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-medium" : ""
                }`}
              >
                {todo.title}
              </span>
            </div>

            {/* TIER 2: Mobile Sub-line Meta Chips (Visible only on < sm mobile screens) */}
            <div className="flex sm:hidden items-center gap-1.5 flex-wrap pt-0.5">
              {/* Priority Badge on Mobile */}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  priorityStyles[todo.priority]?.badge
                }`}
              >
                {priorityStyles[todo.priority]?.label}
              </span>

              {/* Category Tag on Mobile */}
              <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                📁 {todo.category}
              </span>

              {/* Due Date Chip on Mobile */}
              {dueDateText && (
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isOverdue
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      : isCompleted
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {isOverdue ? <AlertTriangle className="w-2.5 h-2.5 text-rose-500" /> : <Clock className="w-2.5 h-2.5" />}
                  <span>{dueDateText}</span>
                </div>
              )}

              {/* Subtask count on Mobile */}
              {totalSubtasks > 0 && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                  <ListCheck className="w-2.5 h-2.5 text-indigo-500" />
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Subtasks + Dates + Chevron */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-0.5 sm:mt-0">
          {/* Subtask count pill on Desktop */}
          {totalSubtasks > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <ListCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Due Date Chip on Desktop */}
          {dueDateText ? (
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                isOverdue
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  : isCompleted
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {isOverdue ? <AlertTriangle className="w-3 h-3 text-rose-500" /> : <Clock className="w-3 h-3" />}
              <span>{dueDateText}</span>
            </div>
          ) : (
            <span className="hidden lg:inline-block text-[11px] text-slate-400 px-2 py-0.5">Không hạn</span>
          )}

          {/* Expand / Collapse Chevron */}
          <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 transition">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* INLINE EXPANDED DETAILS (Reveals right underneath without any modal or background blur) */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 pb-5 pt-3 sm:px-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3.5 animate-fade-in"
        >
          {/* Expanded Task Title Header on Mobile */}
          <div className="sm:hidden p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${priorityStyles[todo.priority]?.badge}`}>
                {priorityStyles[todo.priority]?.label}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                📁 {todo.category}
              </span>
            </div>
            <h3 className={`text-sm font-bold text-slate-900 dark:text-white leading-snug break-words ${isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
              {todo.title}
            </h3>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mô tả công việc & Ghi chú</span>
            </p>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {todo.description || <span className="italic text-slate-400">Không có mô tả chi tiết.</span>}
            </div>
          </div>

          {/* Subtasks Checklist with Live Checkboxes */}
          {totalSubtasks > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ListCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Việc con ({completedSubtasks}/{totalSubtasks})
                  </span>
                </p>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {subtaskProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {todo.subtasks?.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onToggleSubtask(st.id, !st.is_completed)}
                    className={`p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer text-xs ${
                      st.is_completed
                        ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40 text-slate-400 line-through"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400 shadow-xs"
                    }`}
                  >
                    {st.is_completed ? (
                      <CheckSquare2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time & Dates Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[10px] font-semibold text-slate-400 block">Bắt đầu</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {todo.start_date ? format(parseISO(todo.start_date), "HH:mm • dd/MM/yyyy", { locale: vi }) : "Linh hoạt"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[10px] font-semibold text-slate-400 block">Hạn hoàn thành</span>
              <span className={`text-xs font-bold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}>
                {todo.due_date ? format(parseISO(todo.due_date), "HH:mm • dd/MM/yyyy", { locale: vi }) : "Không đặt hạn"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 block">Nhắc nhở qua email</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {todo.reminder_time ? format(parseISO(todo.reminder_time), "HH:mm • dd/MM", { locale: vi }) : "Tự động trước 1 ngày"}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {todo.status !== "COMPLETED" ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(todo.id, "COMPLETED")}
                  className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Hoàn thành ngay</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStatusChange(todo.id, "IN_PROGRESS")}
                  className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Làm lại việc này</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                className="px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Xóa</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onEdit(todo)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh Sửa Công Việc</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
