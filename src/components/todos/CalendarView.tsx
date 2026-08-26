"use client";

import React, { useState, useEffect } from "react";
import { Todo, Status } from "@/types";
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
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Clock,
  Tag,
  AlertCircle,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { TaskDetailPopover } from "./TaskDetailPopover";

interface CalendarViewProps {
  todos: Todo[];
  selectedTodo?: Todo | null;
  onSelectTodo: (todo: Todo) => void;
  onCloseDetail: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
  onOpenNewTaskModal: (status?: any, initialDate?: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  todos,
  selectedTodo,
  onSelectTodo,
  onCloseDetail,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
  onOpenNewTaskModal,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [viewingDayData, setViewingDayData] = useState<{ day: Date; todos: Todo[]; dayIndex: number } | null>(null);
  const [mobileSelectedDate, setMobileSelectedDate] = useState<Date>(new Date());

  // When selectedTodo becomes null (e.g. closed), also reset selectedDayIndex
  useEffect(() => {
    if (!selectedTodo) {
      setSelectedDayIndex(null);
    }
  }, [selectedTodo]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    onCloseDetail();
    setSelectedDayIndex(null);
    setViewingDayData(null);
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    onCloseDetail();
    setSelectedDayIndex(null);
    setViewingDayData(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setMobileSelectedDate(today);
    onCloseDetail();
    setSelectedDayIndex(null);
    setViewingDayData(null);
  };

  const getPriorityStyle = (priority: string, status: Status) => {
    if (status === "COMPLETED") {
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30";
    }

    switch (priority) {
      case "URGENT":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25";
      case "HIGH":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25";
      case "MEDIUM":
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25";
      case "LOW":
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 hover:bg-slate-500/25";
      default:
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25";
    }
  };

  // Determine Smart Glow & Neon Color for Days with tasks
  const getDayGlow = (dayTodos: Todo[]) => {
    if (dayTodos.length === 0) return null;

    const hasUrgentOrOverdue = dayTodos.some((t) => {
      if (t.status === "COMPLETED") return false;
      if (t.priority === "URGENT" || t.priority === "HIGH") return true;
      if (t.due_date && parseISO(t.due_date) < new Date()) return true;
      return false;
    });

    const isAllCompleted = dayTodos.length > 0 && dayTodos.every((t) => t.status === "COMPLETED");

    if (hasUrgentOrOverdue) {
      return {
        type: "urgent",
        glowClass: "border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.3)] bg-rose-500/5 dark:bg-rose-950/25",
        mobileGlowClass: "border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.4)] bg-rose-500/15 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold",
        badgeClass: "bg-rose-500 text-white shadow-xs shadow-rose-500/40",
        dotColor: "bg-rose-500",
      };
    }

    if (isAllCompleted) {
      return {
        type: "completed",
        glowClass: "border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.25)] bg-emerald-500/5 dark:bg-emerald-950/25",
        mobileGlowClass: "border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.35)] bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold",
        badgeClass: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/40",
        dotColor: "bg-emerald-500",
      };
    }

    return {
      type: "pending",
      glowClass: "border-indigo-500/70 shadow-[0_0_12px_rgba(99,102,241,0.3)] bg-indigo-500/5 dark:bg-indigo-950/25",
      mobileGlowClass: "border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.4)] bg-indigo-500/15 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold",
      badgeClass: "bg-indigo-600 text-white shadow-xs shadow-indigo-500/40",
      dotColor: "bg-indigo-500",
    };
  };

  // Calculate anchored position for the task detail popover right next to the selected day cell
  const getPopoverPositionStyle = (): React.CSSProperties => {
    if (selectedDayIndex === null) {
      return { display: "none" };
    }

    const colIndex = selectedDayIndex % 7; // 0 (Mon) to 6 (Sun)
    const rowIndex = Math.floor(selectedDayIndex / 7); // 0 to ~5

    const topPx = rowIndex >= 3 ? Math.max(10, rowIndex * 165 - 110) : rowIndex * 165 + 10;

    if (colIndex <= 3) {
      // Columns Mon - Thu: Place popover to the right of the cell
      const leftPercent = ((colIndex + 1) / 7) * 100;
      return {
        position: "absolute",
        top: `${topPx}px`,
        left: `calc(${leftPercent}% + 8px)`,
      };
    } else {
      // Columns Fri - Sun: Place popover to the left of the cell
      const rightPercent = ((7 - colIndex) / 7) * 100;
      return {
        position: "absolute",
        top: `${topPx}px`,
        right: `calc(${rightPercent}% - 8px)`,
      };
    }
  };

  // Calculate anchored position for the day tasks list popover right next to the clicked day cell
  const getDayPopoverPositionStyle = (dayIndex: number): React.CSSProperties => {
    const colIndex = dayIndex % 7; // 0 (Mon) to 6 (Sun)
    const rowIndex = Math.floor(dayIndex / 7); // 0 to ~5

    const topPx = rowIndex >= 3 ? Math.max(10, rowIndex * 165 - 110) : rowIndex * 165 + 10;

    if (colIndex <= 3) {
      // Columns Mon - Thu: Place popover to the right of the cell
      const leftPercent = ((colIndex + 1) / 7) * 100;
      return {
        position: "absolute",
        top: `${topPx}px`,
        left: `calc(${leftPercent}% + 8px)`,
      };
    } else {
      // Columns Fri - Sun: Place popover to the left of the cell
      const rightPercent = ((7 - colIndex) / 7) * 100;
      return {
        position: "absolute",
        top: `${topPx}px`,
        right: `calc(${rightPercent}% - 8px)`,
      };
    }
  };

  const isTaskEligibleForCalendar = !!(
    selectedTodo &&
    (selectedTodo.due_date || selectedTodo.start_date) &&
    selectedDayIndex !== null
  );

  // Filter tasks for mobile selected date
  const mobileSelectedTodos = todos.filter((todo) => {
    const dateToCheck = todo.due_date || todo.start_date;
    if (!dateToCheck) return false;
    try {
      return isSameDay(parseISO(dateToCheck), mobileSelectedDate);
    } catch {
      return false;
    }
  });

  return (
    <div className="relative glass-panel rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800/80 w-full shadow-lg">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
              {format(currentMonth, "MMMM yyyy", { locale: vi })}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Bấm vào bất kỳ công việc nào để xem chi tiết bên cạnh</p>
            <p className="text-xs text-slate-400 mt-0.5 block sm:hidden">Chạm vào ngày phát sáng để xem danh sách việc</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={goToToday}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Hôm Nay
          </button>
          <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: Apple Calendar Matrix + Selected Day Agenda (< md) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-6">
        {/* Compact Mobile Month Matrix */}
        <div className="bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <div key={day} className="py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {/* Days Mini Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              const isSelectedOnMobile = isSameDay(day, mobileSelectedDate);

              const dayTodos = todos.filter((todo) => {
                const dateToCheck = todo.due_date || todo.start_date;
                if (!dateToCheck) return false;
                try {
                  return isSameDay(parseISO(dateToCheck), day);
                } catch {
                  return false;
                }
              });

              const glow = getDayGlow(dayTodos);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMobileSelectedDate(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelectedOnMobile
                      ? "bg-indigo-600 text-white font-black ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/40 scale-105 z-10"
                      : isCurrentDay
                      ? "ring-2 ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold"
                      : glow
                      ? glow.mobileGlowClass
                      : isSelectedMonth
                      ? "bg-white/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "text-slate-400/40 opacity-30"
                  }`}
                >
                  <span className="text-xs">{format(day, "d")}</span>

                  {/* Colored Dots / Glow Indicator */}
                  {dayTodos.length > 0 && (
                    <div className="absolute bottom-1 flex items-center gap-0.5 justify-center">
                      {isSelectedOnMobile ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${glow?.dotColor || "bg-indigo-500"}`} />
                      )}
                    </div>
                  )}

                  {/* Task count pill if > 1 task */}
                  {dayTodos.length > 1 && !isSelectedOnMobile && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-black w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      {dayTodos.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Header & Task Cards (< md) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                {format(mobileSelectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {mobileSelectedTodos.length} việc
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewTaskModal("TODO", mobileSelectedDate)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </div>

          {/* List of full-width mobile cards */}
          {mobileSelectedTodos.length > 0 ? (
            <div className="space-y-2.5">
              {mobileSelectedTodos.map((todo) => {
                const isCompleted = todo.status === "COMPLETED";
                const isOverdue = todo.due_date && parseISO(todo.due_date) < new Date() && !isCompleted;

                return (
                  <div
                    key={todo.id}
                    className={`p-3.5 rounded-2xl border transition-all glass-card ${
                      isCompleted
                        ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-75"
                        : isOverdue
                        ? "border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/20 shadow-sm"
                        : "border-slate-200/80 dark:border-slate-800/80 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onStatusChange(todo.id, isCompleted ? "TODO" : "COMPLETED")}
                          className="mt-0.5 flex-shrink-0 cursor-pointer text-slate-400 hover:text-indigo-600 transition"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onEdit(todo)}
                            className={`text-sm font-bold truncate cursor-pointer ${
                              isCompleted
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-900 dark:text-slate-100 hover:text-indigo-600"
                            }`}
                          >
                            {todo.title}
                          </h4>

                          {todo.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {todo.description}
                            </p>
                          )}

                          {/* Meta Row: Time, Category, Priority */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {todo.due_date && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {format(parseISO(todo.due_date), "HH:mm")}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              <Tag className="w-2.5 h-2.5" />
                              {todo.category || "General"}
                            </span>

                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getPriorityStyle(todo.priority, todo.status)}`}>
                              {todo.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(todo)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(todo.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto opacity-80" />
              <p className="text-xs font-semibold text-slate-500">
                Không có công việc nào trong ngày {format(mobileSelectedDate, "dd/MM")}.
              </p>
              <button
                type="button"
                onClick={() => onOpenNewTaskModal("TODO", mobileSelectedDate)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Việc Ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP VIEW: Full 7-Column Grid with Glowing Days & Popovers (>= md) */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-3 mb-3 text-center">
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day) => (
            <div
              key={day}
              className="py-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Container (with separate overlay layer) */}
        <div className="relative w-full">
          {/* Pure CSS Grid for Days */}
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, idx) => {
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              const isDaySelected = (selectedDayIndex === idx && !!selectedTodo) || (viewingDayData?.dayIndex === idx);

              // Find tasks due or started on this day
              const dayTodos = todos.filter((todo) => {
                const dateToCheck = todo.due_date || todo.start_date;
                if (!dateToCheck) return false;
                try {
                  return isSameDay(parseISO(dateToCheck), day);
                } catch {
                  return false;
                }
              });

              // Smart Glow calculation
              const glow = getDayGlow(dayTodos);

              // Show max 2 tasks in cell, then "+N việc khác..."
              const visibleTodos = dayTodos.slice(0, 2);
              const remainingCount = dayTodos.length - 2;

              return (
                <div
                  key={idx}
                  className={`min-h-[145px] sm:min-h-[160px] p-3 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isDaySelected
                      ? "ring-2 ring-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : glow
                      ? glow.glowClass
                      : isCurrentDay
                      ? "ring-2 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30"
                      : isSelectedMonth
                      ? "bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md"
                      : "bg-slate-50/20 dark:bg-slate-950/20 border-slate-200/30 dark:border-slate-800/30 opacity-40"
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-extrabold w-7 h-7 flex items-center justify-center rounded-xl transition ${
                          isCurrentDay
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                            : isSelectedMonth
                            ? "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600"
                            : "text-slate-400"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Day tasks counter pill if has glow */}
                      {dayTodos.length > 0 && glow && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${glow.badgeClass}`}>
                          {dayTodos.length}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseDetail();
                        setSelectedDayIndex(null);
                        setViewingDayData(null);
                        onOpenNewTaskModal("TODO", day);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Thêm việc vào ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Chips in Day (Max 2 + Show More) */}
                  <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-start">
                    {visibleTodos.map((todo) => {
                      const isCompleted = todo.status === "COMPLETED";

                      return (
                        <button
                          type="button"
                          key={todo.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDayData(null);
                            setSelectedDayIndex(idx);
                            onSelectTodo(todo);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-xl text-xs font-semibold truncate block transition border ${getPriorityStyle(
                            todo.priority,
                            todo.status
                          )} cursor-pointer ${
                            selectedTodo?.id === todo.id ? "ring-2 ring-indigo-500 scale-[1.02]" : ""
                          }`}
                          title={`${todo.title} - Bấm để xem chi tiết`}
                        >
                          <div className="flex items-center gap-1">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                            )}
                            <span className={`truncate ${isCompleted ? "line-through opacity-80" : ""}`}>
                              {todo.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* +N việc khác... button */}
                    {remainingCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseDetail();
                          setSelectedDayIndex(null);
                          setViewingDayData({ day, todos: dayTodos, dayIndex: idx });
                        }}
                        className="w-full text-center py-1 px-1.5 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer border border-indigo-200/50 dark:border-indigo-800/40"
                      >
                        ••• +{remainingCount} việc khác
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Anchored Day Tasks Mini-Popover (No full-screen backdrop, pure local contextual popup) */}
          {viewingDayData && (
            <>
              {/* Transparent click-catcher to dismiss when clicking outside */}
              <div
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setViewingDayData(null)}
              />

              <div className="absolute inset-0 pointer-events-none z-30">
                <div
                  className="pointer-events-auto w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl animate-fade-in space-y-3"
                  style={getDayPopoverPositionStyle(viewingDayData.dayIndex)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {format(viewingDayData.day, "EEEE, dd/MM", { locale: vi })}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {viewingDayData.todos.length} công việc trong ngày
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingDayData(null)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                    {viewingDayData.todos.map((t) => {
                      const isCompleted = t.status === "COMPLETED";

                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            const clickedTodo = t;
                            const currentIdx = viewingDayData.dayIndex;
                            setViewingDayData(null);
                            setSelectedDayIndex(currentIdx);
                            onSelectTodo(clickedTodo);
                          }}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer group ${
                            isCompleted
                              ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/50"
                              : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 group-hover:scale-125 transition" />
                            )}
                            <span
                              className={`text-xs font-semibold truncate ${
                                isCompleted
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                              }`}
                            >
                              {t.title}
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                            {t.due_date ? format(parseISO(t.due_date), "HH:mm") : "--:--"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add new task button for this specific day */}
                  <button
                    type="button"
                    onClick={() => {
                      const targetDay = viewingDayData.day;
                      setViewingDayData(null);
                      onOpenNewTaskModal("TODO", targetDay);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Việc Mới</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Floating Overlay Layer (Out of Grid Flow) for Anchored Detail Popover */}
          {isTaskEligibleForCalendar && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <div className="pointer-events-auto" style={getPopoverPositionStyle()}>
                <TaskDetailPopover
                  isOpen={true}
                  todo={selectedTodo}
                  onClose={() => {
                    onCloseDetail();
                    setSelectedDayIndex(null);
                  }}
                  onEdit={(t) => {
                    onCloseDetail();
                    setSelectedDayIndex(null);
                    onEdit(t);
                  }}
                  onDelete={(id) => {
                    onCloseDetail();
                    setSelectedDayIndex(null);
                    onDelete(id);
                  }}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
