"use client";

import React, { useState } from "react";
import { Todo, Priority, Status } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  ListCheck,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import confetti from "canvas-confetti";

interface TodoCardProps {
  todo: Todo;
  onSelectTodo?: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onSelectTodo,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

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

  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return "badge-urgent";
      case "HIGH":
        return "badge-high";
      case "MEDIUM":
        return "badge-medium";
      case "LOW":
        return "badge-low";
    }
  };

  // Due date formatting and color coding
  let dueDateText = "";
  let dueDateColor = "text-slate-400";
  if (todo.due_date) {
    try {
      const date = parseISO(todo.due_date);
      if (isPast(date) && !isToday(date) && !isCompleted) {
        dueDateText = `Quá hạn (${format(date, "dd/MM HH:mm")})`;
        dueDateColor = "text-rose-500 font-semibold";
      } else if (isToday(date)) {
        dueDateText = `Hôm nay lúc ${format(date, "HH:mm")}`;
        dueDateColor = "text-blue-500 font-medium";
      } else if (isTomorrow(date)) {
        dueDateText = `Ngày mai lúc ${format(date, "HH:mm")}`;
        dueDateColor = "text-amber-500";
      } else {
        dueDateText = format(date, "dd/MM/yyyy HH:mm");
      }
    } catch {
      dueDateText = todo.due_date;
    }
  }

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectTodo) onSelectTodo(todo);
      }}
      className={`glass-card rounded-2xl p-4 border transition duration-200 relative group cursor-pointer ${
        isCompleted
          ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50"
          : "border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggleComplete}
          className={`mt-0.5 p-1 rounded-lg transition cursor-pointer ${
            isCompleted
              ? "text-emerald-500 hover:text-emerald-600"
              : "text-slate-400 hover:text-indigo-600"
          }`}
          title={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getPriorityClass(
                todo.priority
              )}`}
            >
              {todo.priority}
            </span>

            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              📁 {todo.category}
            </span>

            {todo.is_reminder_sent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Đã gửi mail
              </span>
            )}
            {!todo.is_reminder_sent && todo.reminder_time && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Bell className="w-3 h-3" /> Có hẹn giờ mail
              </span>
            )}
          </div>

          <h3
            className={`text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition tracking-tight ${
              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtasks(!showSubtasks);
                  }}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
                >
                  <ListCheck className="w-3.5 h-3.5" />
                  <span>
                    Việc con ({completedSubtasks}/{totalSubtasks})
                  </span>
                  {showSubtasks ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                <span className="font-semibold">{Math.round(subtaskProgress)}%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Subtask list expanded */}
              {showSubtasks && (
                <div className="mt-2.5 space-y-1.5 pl-1">
                  {todo.subtasks.map((s) => (
                    <div
                      key={s.id}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={s.is_completed}
                        onChange={(e) => onToggleSubtask(s.id, e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={s.is_completed ? "line-through text-slate-400" : ""}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card Footer: Due Date & Action buttons */}
          <div className="mt-3.5 pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/60">
            {dueDateText ? (
              <div className={`flex items-center gap-1.5 ${dueDateColor}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{dueDateText}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">Không có hạn</span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(todo);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(todo.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
