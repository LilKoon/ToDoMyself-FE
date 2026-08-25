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
  ArrowRight,
  ListTodo,
  CheckSquare2,
} from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { vi } from "date-fns/locale";

interface TaskDetailDrawerProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  isOpen,
  todo,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}) => {
  if (!isOpen || !todo) return null;

  const priorityStyles: Record<Priority, { label: string; badge: string }> = {
    URGENT: { label: "Khẩn Cấp", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
    HIGH: { label: "Quan Trọng", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    MEDIUM: { label: "Trung Bình", badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
    LOW: { label: "Thấp", badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30" },
  };

  const statusStyles: Record<Status, { label: string; badge: string; icon: any }> = {
    TODO: { label: "Cần Làm", badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30", icon: Circle },
    IN_PROGRESS: { label: "Đang Thực Hiện", badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30", icon: Clock },
    COMPLETED: { label: "Hoàn Thành", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
    CANCELLED: { label: "Đã Hủy", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30", icon: AlertCircle },
  };

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const isDueOverdue = todo.due_date && isPast(parseISO(todo.due_date)) && !isToday(parseISO(todo.due_date)) && todo.status !== "COMPLETED";

  const StatusIcon = statusStyles[todo.status]?.icon || Circle;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${statusStyles[todo.status]?.badge}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusStyles[todo.status]?.label}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${priorityStyles[todo.priority]?.badge}`}>
                {priorityStyles[todo.priority]?.label}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {todo.category}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className={`text-2xl font-black tracking-tight text-slate-900 dark:text-white ${todo.status === "COMPLETED" ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                {todo.title}
              </h2>
            </div>

            {/* Dates & Reminders Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isDueOverdue ? "bg-rose-500/10 text-rose-600" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Hạn hoàn thành</p>
                  <p className={`text-xs font-bold ${isDueOverdue ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-slate-800 dark:text-slate-200"}`}>
                    {todo.due_date ? format(parseISO(todo.due_date), "HH:mm • dd/MM/yyyy", { locale: vi }) : "Không đặt hạn"}
                    {isDueOverdue && " (Quá hạn)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Giờ nhắc nhở</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {todo.reminder_time ? format(parseISO(todo.reminder_time), "HH:mm • dd/MM/yyyy", { locale: vi }) : "Tự động trước 1 ngày"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                Mô tả chi tiết
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                {todo.description ? todo.description : <span className="italic text-slate-400">Không có mô tả chi tiết cho công việc này.</span>}
              </div>
            </div>

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                  Danh sách việc con ({completedSubtasks}/{totalSubtasks})
                </h3>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </span>
                )}
              </div>

              {totalSubtasks > 0 && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {todo.subtasks && todo.subtasks.length > 0 ? (
                  todo.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      onClick={() => onToggleSubtask(subtask.id, !subtask.is_completed)}
                      className={`p-3 rounded-xl border transition flex items-center gap-3 cursor-pointer select-none ${
                        subtask.is_completed
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-slate-400 line-through"
                          : "bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      {subtask.is_completed ? (
                        <CheckSquare2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium flex-1">{subtask.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    Chưa có việc con nào được thêm.
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Timestamps */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
              <span>Tạo lúc: {format(parseISO(todo.created_at), "HH:mm:ss • dd/MM/yyyy", { locale: vi })}</span>
              {todo.updated_at && <span>Cập nhật gần nhất: {format(parseISO(todo.updated_at), "HH:mm:ss • dd/MM/yyyy", { locale: vi })}</span>}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col gap-3">
            {/* Primary Edit Button */}
            <button
              onClick={() => {
                onClose();
                onEdit(todo);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh Sửa Toàn Diện Công Việc</span>
            </button>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-3">
              {todo.status !== "COMPLETED" ? (
                <button
                  onClick={() => {
                    onStatusChange(todo.id, "COMPLETED");
                  }}
                  className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Hoàn thành ngay</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onStatusChange(todo.id, "IN_PROGRESS");
                  }}
                  className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Làm lại việc này</span>
                </button>
              )}

              <button
                onClick={() => {
                  onDelete(todo.id);
                  onClose();
                }}
                className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Xóa công việc</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
