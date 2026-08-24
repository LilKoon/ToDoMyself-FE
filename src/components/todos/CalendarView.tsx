"use client";

import React, { useState } from "react";
import { Todo } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onOpenNewTaskModal: (status?: any, initialDate?: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  todos,
  onEdit,
  onOpenNewTaskModal,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500 text-white";
      case "HIGH":
        return "bg-amber-500 text-white";
      case "MEDIUM":
        return "bg-indigo-500 text-white";
      case "LOW":
        return "bg-slate-400 text-white";
      default:
        return "bg-indigo-500 text-white";
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Hôm Nay
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isSelectedMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          // Find tasks due on this day
          const dayTodos = todos.filter((todo) => {
            if (!todo.due_date) return false;
            try {
              return isSameDay(parseISO(todo.due_date), day);
            } catch {
              return false;
            }
          });

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 rounded-2xl border transition flex flex-col justify-between group ${
                isSelectedMonth
                  ? "bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60"
                  : "bg-slate-50/20 dark:bg-slate-950/20 border-transparent opacity-40"
              } ${isCurrentDay ? "ring-2 ring-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20" : ""}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isCurrentDay
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isSelectedMonth
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <button
                  onClick={() => onOpenNewTaskModal("TODO", day)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition"
                  title="Thêm việc ngày này"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task Pills */}
              <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                {dayTodos.map((todo) => (
                  <button
                    key={todo.id}
                    onClick={() => onEdit(todo)}
                    className={`w-full text-left px-2 py-0.5 rounded-lg text-[11px] font-medium truncate block transition shadow-sm ${getPriorityColor(
                      todo.priority
                    )} ${todo.status === "COMPLETED" ? "opacity-50 line-through" : ""}`}
                    title={todo.title}
                  >
                    {todo.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
