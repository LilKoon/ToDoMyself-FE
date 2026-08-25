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
  ArrowRight,
  ArrowLeft,
  ListCheck,
  Tag,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";

interface KanbanCardProps {
  todo: Todo;
  isCompact?: boolean;
  onSelectTodo: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  todo,
  isCompact = false,
  onSelectTodo,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}) => {
  const isCompleted = todo.status === "COMPLETED";

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
      } else {
        dueDateText = format(d, "dd/MM");
      }
    } catch {
      dueDateText = "";
    }
  }

  const completedSubtasks = todo.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Next and Previous Status transitions
  const getPrevStatus = (cur: Status): Status => {
    if (cur === "CANCELLED") return "COMPLETED";
    if (cur === "COMPLETED") return "IN_PROGRESS";
    return "TODO";
  };

  const getNextStatus = (cur: Status): Status => {
    if (cur === "TODO") return "IN_PROGRESS";
    return "COMPLETED";
  };

  /* =========================================================================
     COMPACT MODE CARD (Ultra-thin, High Density)
     ========================================================================= */
  if (isCompact) {
    return (
      <div
        onClick={() => onSelectTodo(todo)}
        className={`group p-2.5 rounded-xl border bg-white dark:bg-slate-900/90 transition-all hover:shadow-md hover:border-indigo-500/50 flex items-center justify-between gap-2 cursor-pointer ${
          isCompleted
            ? "opacity-60 border-slate-200/50 dark:border-slate-800/50"
            : "border-slate-200/90 dark:border-slate-800 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityStyles[todo.priority]?.dot || "bg-indigo-500"}`}
            title={`Mức độ: ${priorityStyles[todo.priority]?.label}`}
          />
          <span
            className={`text-xs font-bold text-slate-900 dark:text-slate-100 truncate ${
              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}
          >
            {todo.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {totalSubtasks > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <ListCheck className="w-3 h-3 text-slate-400" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {dueDateText && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                isOverdue
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {dueDateText}
            </span>
          )}

          {/* Quick Shift Arrows */}
          <div
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition"
            onClick={(e) => e.stopPropagation()}
          >
            {todo.status !== "TODO" && (
              <button
                type="button"
                onClick={() => onStatusChange(todo.id, getPrevStatus(todo.status))}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Lùi trạng thái"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {todo.status !== "COMPLETED" && todo.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => onStatusChange(todo.id, getNextStatus(todo.status))}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tiến trạng thái"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     DETAILED MODE CARD (Rich Preview)
     ========================================================================= */
  return (
    <div
      onClick={() => onSelectTodo(todo)}
      className={`group p-3.5 rounded-2xl border bg-white dark:bg-slate-900/90 transition-all hover:shadow-lg hover:border-indigo-500/50 cursor-pointer flex flex-col gap-2.5 ${
        isCompleted
          ? "opacity-60 border-slate-200/50 dark:border-slate-800/50"
          : "border-slate-200/90 dark:border-slate-800 shadow-sm"
      }`}
    >
      {/* Header: Priority & Category */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            priorityStyles[todo.priority]?.badge
          }`}
        >
          {priorityStyles[todo.priority]?.label}
        </span>

        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">
          📁 {todo.category}
        </span>
      </div>

      {/* Title */}
      <h4
        className={`text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition ${
          isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
        }`}
      >
        {todo.title}
      </h4>

      {/* Description Preview */}
      {todo.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
          {todo.description}
        </p>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <ListCheck className="w-3 h-3" />
              <span>Việc con ({completedSubtasks}/{totalSubtasks})</span>
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Date & Quick Shift Controls */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {dueDateText ? (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold ${
              isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{dueDateText}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">Không có hạn</span>
        )}

        {/* Quick Shift Buttons */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
          onClick={(e) => e.stopPropagation()}
        >
          {todo.status !== "TODO" && (
            <button
              type="button"
              onClick={() => onStatusChange(todo.id, getPrevStatus(todo.status))}
              className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-indigo-600 hover:text-white transition flex items-center gap-0.5 font-bold cursor-pointer"
              title="Lùi 1 cột"
            >
              <ArrowLeft className="w-3 h-3" /> Lùi
            </button>
          )}

          {todo.status !== "COMPLETED" && todo.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => onStatusChange(todo.id, getNextStatus(todo.status))}
              className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-600 hover:text-white transition flex items-center gap-0.5 font-bold cursor-pointer"
              title="Tiến 1 cột"
            >
              Tiến <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
