"use client";

import React from "react";
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
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import confetti from "canvas-confetti";

interface TaskRowProps {
  todo: Todo;
  onSelectTodo: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  todo,
  onSelectTodo,
  onEdit,
  onDelete,
  onStatusChange,
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

  return (
    <div
      onClick={() => onSelectTodo(todo)}
      className={`group px-4 py-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
        isCompleted
          ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
          : isOverdue
          ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 hover:border-rose-400 shadow-xs"
          : "bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-md"
      }`}
    >
      {/* Left: Checkbox + Priority + Title + Category */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggleComplete}
          className={`p-1 rounded-lg transition flex-shrink-0 cursor-pointer ${
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

        {/* Priority Badge */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
            priorityStyles[todo.priority]?.badge
          }`}
        >
          {priorityStyles[todo.priority]?.label}
        </span>

        {/* Category Pill */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
          📁 {todo.category}
        </span>

        {/* Task Title */}
        <span
          className={`text-sm font-bold text-slate-900 dark:text-white truncate flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition tracking-tight ${
            isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-medium" : ""
          }`}
        >
          {todo.title}
        </span>
      </div>

      {/* Right: Subtasks + Dates + Quick Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Subtask count pill */}
        {totalSubtasks > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
            <ListCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {completedSubtasks}/{totalSubtasks} việc con
            </span>
          </div>
        )}

        {/* Due Date Chip */}
        {dueDateText ? (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
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

        {/* Hover Action Buttons */}
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
            title="Chỉnh sửa công việc"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
            title="Xóa công việc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
