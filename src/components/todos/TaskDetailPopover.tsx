"use client";

import React from "react";
import { Todo, Priority, Status } from "@/types";
import {
  X,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Hourglass,
  CheckSquare2,
  Plus,
} from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { vi } from "date-fns/locale";

interface TaskDetailPopoverProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
}

export const TaskDetailPopover: React.FC<TaskDetailPopoverProps> = ({
  isOpen,
  todo,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}) => {
  if (!isOpen || !todo) return null;

  const priorityLabels: Record<Priority, { label: string; color: string }> = {
    URGENT: { label: "Khẩn Cấp", color: "text-rose-600 dark:text-rose-400" },
    HIGH: { label: "Quan Trọng", color: "text-amber-600 dark:text-amber-400" },
    MEDIUM: { label: "Trung Bình", color: "text-indigo-600 dark:text-indigo-400" },
    LOW: { label: "Thấp", color: "text-slate-600 dark:text-slate-400" },
  };

  const statusLabels: Record<Status, { label: string; color: string }> = {
    TODO: { label: "Cần Làm", color: "text-slate-700 dark:text-slate-300" },
    IN_PROGRESS: { label: "Đang Làm", color: "text-indigo-600 dark:text-indigo-400" },
    COMPLETED: { label: "Hoàn Thành", color: "text-emerald-600 dark:text-emerald-400" },
    CANCELLED: { label: "Đã Hủy", color: "text-rose-600 dark:text-rose-400" },
  };

  const isDueOverdue =
    todo.due_date &&
    isPast(parseISO(todo.due_date)) &&
    !isToday(parseISO(todo.due_date)) &&
    todo.status !== "COMPLETED";

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  const displayDateHeader = todo.due_date
    ? format(parseISO(todo.due_date), "EEEE, dd/MM/yyyy", { locale: vi })
    : todo.start_date
    ? format(parseISO(todo.start_date), "EEEE, dd/MM/yyyy", { locale: vi })
    : format(parseISO(todo.created_at), "EEEE, dd/MM/yyyy", { locale: vi });

  return (
    /* Non-blocking wrapper positioned on the side */
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Side-Docked Detail Card: Positioned on the right side beside the calendar */}
      <div className="pointer-events-auto absolute right-4 sm:right-8 top-20 sm:top-24 w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] ring-1 ring-slate-900/10 dark:ring-white/10 animate-scale-up">
        
        {/* Header Row */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Chi Tiết Công Việc
            </h2>
            <p className="text-[11px] text-slate-400 capitalize mt-0.5">
              {displayDateHeader}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>


        {/* 3 Metrics Summary Cards (Compact & Refined) */}
        <div className="grid grid-cols-3 gap-2 my-3.5">
          {/* Card 1: Giờ vào / Bắt đầu */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Clock className="w-3 h-3" />
              <span>Giờ vào</span>
            </div>
            <div className="my-1">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {todo.start_date ? format(parseISO(todo.start_date), "HH:mm") : "--:--"}
              </span>
              <span className="ml-1 text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {todo.start_date ? format(parseISO(todo.start_date), "dd/MM") : "Chưa đặt"}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate">
              {todo.start_date ? "Khởi chạy" : "Linh hoạt"}
            </p>
          </div>

          {/* Card 2: Giờ ra / Hạn chót */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDueOverdue
              ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-800/50"
              : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/50"
          }`}>
            <div className={`flex items-center gap-1 text-[10px] font-semibold ${isDueOverdue ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
              <Calendar className="w-3 h-3" />
              <span>Giờ ra</span>
            </div>
            <div className="my-1">
              <span className={`text-sm font-black ${isDueOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                {todo.due_date ? format(parseISO(todo.due_date), "HH:mm") : "--:--"}
              </span>
              <span className={`ml-1 text-[9px] font-bold px-1 py-0.2 rounded ${
                isDueOverdue
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
              }`}>
                {todo.due_date ? (isDueOverdue ? "Quá hạn" : format(parseISO(todo.due_date), "dd/MM")) : "Không hạn"}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate">
              {todo.reminder_time ? "Có nhắc email" : "Nhắc 1 ngày"}
            </p>
          </div>

          {/* Card 3: Trạng thái & Ưu tiên */}
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>Trạng thái</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block truncate">
                {statusLabels[todo.status]?.label}
              </span>
            </div>
            <p className={`text-[9px] font-bold truncate ${priorityLabels[todo.priority]?.color}`}>
              {priorityLabels[todo.priority]?.label}
            </p>
          </div>
        </div>

        {/* Category & Task Title */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 mb-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700 flex-shrink-0 mt-0.5">
            <Hourglass className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                Danh mục: {todo.category}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                #{todo.id}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {todo.title}
            </p>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Mô tả công việc & Ghi chú
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-20 overflow-y-auto whitespace-pre-wrap">
            {todo.description || <span className="italic text-slate-400">Không có ghi chú mô tả.</span>}
          </div>
        </div>

        {/* Subtasks Checklist */}
        {totalSubtasks > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Việc con ({completedSubtasks}/{totalSubtasks})</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round((completedSubtasks / totalSubtasks) * 100)}%
              </span>
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {todo.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(st.id, !st.is_completed)}
                  className={`p-1.5 rounded-lg border transition flex items-center gap-2 cursor-pointer text-xs ${
                    st.is_completed
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 text-slate-400 line-through"
                      : "bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                  }`}
                >
                  {st.is_completed ? (
                    <CheckSquare2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="flex-1 font-medium truncate">{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {todo.status !== "COMPLETED" ? (
              <button
                onClick={() => onStatusChange(todo.id, "COMPLETED")}
                className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Xong việc</span>
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(todo.id, "IN_PROGRESS")}
                className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>Làm lại</span>
              </button>
            )}

            <button
              onClick={() => {
                onDelete(todo.id);
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Xóa công việc"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onClose();
              onEdit(todo);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/25 transition duration-150 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Chỉnh Sửa Công Việc</span>
          </button>
        </div>

      </div>
    </div>
  );
};
