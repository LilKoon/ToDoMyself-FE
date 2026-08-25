"use client";

import React from "react";
import { Todo, Priority, Status } from "@/types";
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Circle,
  AlertCircle,
  FolderOpen,
  Hourglass,
  ListTodo,
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

  const statusLabels: Record<Status, { label: string; badge: string; color: string }> = {
    TODO: { label: "Cần Làm", badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", color: "text-slate-700" },
    IN_PROGRESS: { label: "Đang Thực Hiện", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300", color: "text-indigo-600" },
    COMPLETED: { label: "Đã Hoàn Thành", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", color: "text-emerald-600" },
    CANCELLED: { label: "Đã Hủy", badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300", color: "text-rose-600" },
  };

  const isDueOverdue =
    todo.due_date &&
    isPast(parseISO(todo.due_date)) &&
    !isToday(parseISO(todo.due_date)) &&
    todo.status !== "COMPLETED";

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  // Format date headers
  const displayDateHeader = todo.due_date
    ? format(parseISO(todo.due_date), "EEEE, dd/MM/yyyy", { locale: vi })
    : todo.start_date
    ? format(parseISO(todo.start_date), "EEEE, dd/MM/yyyy", { locale: vi })
    : format(parseISO(todo.created_at), "EEEE, dd/MM/yyyy", { locale: vi });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header Row (Like Image 1) */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Chi Tiết Công Việc
            </h2>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {displayDateHeader}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Metrics Summary Cards (Styled exactly like image 1!) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          {/* Card 1: Giờ vào / Bắt đầu */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Giờ bắt đầu</span>
            </div>
            <div className="my-2">
              <span className="text-base font-black text-slate-900 dark:text-white">
                {todo.start_date ? format(parseISO(todo.start_date), "HH:mm") : "--:--"}
              </span>
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {todo.start_date ? format(parseISO(todo.start_date), "dd/MM") : "Chưa đặt"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {todo.start_date ? "Thời gian khởi chạy" : "Linh hoạt"}
            </p>
          </div>

          {/* Card 2: Giờ ra / Hạn chót */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
            isDueOverdue
              ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60"
              : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60"
          }`}>
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${isDueOverdue ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Hạn hoàn thành</span>
            </div>
            <div className="my-2">
              <span className={`text-base font-black ${isDueOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                {todo.due_date ? format(parseISO(todo.due_date), "HH:mm") : "--:--"}
              </span>
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isDueOverdue
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
              }`}>
                {todo.due_date ? (isDueOverdue ? "Quá hạn" : format(parseISO(todo.due_date), "dd/MM")) : "Không hạn"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {todo.reminder_time ? "Có hẹn giờ nhắc email" : "Nhắc trước 1 ngày"}
            </p>
          </div>

          {/* Card 3: Trạng thái & Ưu tiên */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Trạng thái & Ưu tiên</span>
            </div>
            <div className="my-2">
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block truncate">
                {statusLabels[todo.status]?.label}
              </span>
            </div>
            <div className="w-full h-1 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden my-1">
              <div className="w-full h-full bg-indigo-600 rounded-full" />
            </div>
            <p className={`text-[10px] font-bold ${priorityLabels[todo.priority]?.color}`}>
              Ưu tiên: {priorityLabels[todo.priority]?.label}
            </p>
          </div>
        </div>

        {/* Category & Task Header Row (Like Image 1) */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mb-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700">
            <Hourglass className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Danh mục: {todo.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                #{todo.id}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {todo.title}
            </p>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Mô tả công việc & Ghi chú
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
            {todo.description || <span className="italic text-slate-400">Không có ghi chú mô tả nào.</span>}
          </div>
        </div>

        {/* Subtasks Checklist */}
        {totalSubtasks > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Việc con ({completedSubtasks}/{totalSubtasks})</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round((completedSubtasks / totalSubtasks) * 100)}%
              </span>
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {todo.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(st.id, !st.is_completed)}
                  className={`p-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer text-xs ${
                    st.is_completed
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 text-slate-400 line-through"
                      : "bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                  }`}
                >
                  {st.is_completed ? (
                    <CheckSquare2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="flex-1 font-medium">{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Row (Styled exactly like image 1 with vibrant Edit Action Button!) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {todo.status !== "COMPLETED" ? (
              <button
                onClick={() => onStatusChange(todo.id, "COMPLETED")}
                className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Xong việc</span>
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(todo.id, "IN_PROGRESS")}
                className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Làm lại</span>
              </button>
            )}

            <button
              onClick={() => {
                onDelete(todo.id);
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Xóa công việc"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Button (+ Chỉnh Sửa Công Việc, styled like "+ Tạo đơn phép" in screenshot 1!) */}
          <button
            onClick={() => {
              onClose();
              onEdit(todo);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 transition duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Chỉnh Sửa Công Việc</span>
          </button>
        </div>

      </div>
    </div>
  );
};
