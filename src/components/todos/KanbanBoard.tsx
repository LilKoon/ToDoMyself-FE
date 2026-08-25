"use client";

import React, { useState } from "react";
import { Todo, Status } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { Plus, LayoutGrid, ListFilter, AlertTriangle, Layers } from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";

interface KanbanBoardProps {
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
  onOpenNewTaskModal: (defaultStatus?: Status) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todos,
  onSelectTodo,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
  onOpenNewTaskModal,
}) => {
  const [isCompact, setIsCompact] = useState<boolean>(false);

  const isTaskOverdue = (todo: Todo): boolean => {
    if (todo.status === "COMPLETED" || todo.status === "CANCELLED") return false;
    if (!todo.due_date) return false;
    try {
      const d = parseISO(todo.due_date);
      return isPast(d) && !isToday(d);
    } catch {
      return false;
    }
  };

  const columns: {
    key: string;
    id: Status;
    title: string;
    color: string;
    badgeBg: string;
    border: string;
    indicator: string;
    filterFn: (t: Todo) => boolean;
  }[] = [
    {
      key: "TODO",
      id: "TODO",
      title: "Cần Làm",
      color: "text-slate-800 dark:text-slate-200",
      badgeBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      border: "border-slate-300/80 dark:border-slate-800",
      indicator: "bg-slate-500",
      filterFn: (t) => t.status === "TODO" && !isTaskOverdue(t),
    },
    {
      key: "IN_PROGRESS",
      id: "IN_PROGRESS",
      title: "Đang Thực Hiện",
      color: "text-indigo-600 dark:text-indigo-400",
      badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-400/40 dark:border-indigo-500/30",
      indicator: "bg-indigo-500",
      filterFn: (t) => t.status === "IN_PROGRESS" && !isTaskOverdue(t),
    },
    {
      key: "OVERDUE",
      id: "TODO",
      title: "Trễ Hạn (Quá Hạn)",
      color: "text-rose-600 dark:text-rose-400 font-black",
      badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-400/40",
      border: "border-rose-400/60 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/10",
      indicator: "bg-rose-500 animate-pulse",
      filterFn: (t) => isTaskOverdue(t),
    },
    {
      key: "COMPLETED",
      id: "COMPLETED",
      title: "Hoàn Thành",
      color: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-400/40 dark:border-emerald-500/30",
      indicator: "bg-emerald-500",
      filterFn: (t) => t.status === "COMPLETED",
    },
    {
      key: "CANCELLED",
      id: "CANCELLED",
      title: "Đã Hủy",
      color: "text-slate-500 dark:text-slate-400",
      badgeBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      border: "border-slate-300/60 dark:border-slate-800/60",
      indicator: "bg-slate-400",
      filterFn: (t) => t.status === "CANCELLED",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Board Controls Toolbar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Bảng quy trình Kanban 5 cột thông minh (Tự động gom việc trễ hạn)</span>
        </div>

        {/* View Mode Toggle: Compact vs Detailed */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setIsCompact(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              !isCompact
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Đầy Đủ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCompact(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              isCompact
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Hiển thị rút gọn để nhìn được nhiều việc cùng lúc không cần cuộn"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Rút Gọn ⚡</span>
          </button>
        </div>
      </div>

      {/* 5 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const colTodos = todos.filter(col.filterFn);

          return (
            <div
              key={col.key}
              className={`glass-panel rounded-3xl p-3.5 flex flex-col border ${col.border} shadow-md h-[680px] max-h-[calc(100vh-270px)]`}
            >
              {/* Sticky Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${col.indicator}`} />
                  <h3 className={`font-black text-xs sm:text-sm tracking-tight truncate ${col.color}`}>
                    {col.title}
                  </h3>
                  <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold flex-shrink-0 ${col.badgeBg}`}>
                    {colTodos.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewTaskModal(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
                  title={`Thêm công việc vào cột ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Independent Scrollable Column Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {colTodos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 font-medium">Trống</p>
                    <button
                      type="button"
                      onClick={() => onOpenNewTaskModal(col.id)}
                      className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Tạo việc
                    </button>
                  </div>
                ) : (
                  colTodos.map((todo) => (
                    <KanbanCard
                      key={todo.id}
                      todo={todo}
                      isCompact={isCompact}
                      onSelectTodo={onSelectTodo}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onToggleSubtask={onToggleSubtask}
                    />
                  ))
                )}
              </div>

              {/* Column Footer: Quick Add */}
              <div className="pt-2.5 mt-1 border-t border-slate-200/40 dark:border-slate-800/40 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenNewTaskModal(col.id)}
                  className="w-full py-1.5 px-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition flex items-center justify-center gap-1 cursor-pointer border border-dashed border-slate-200/60 dark:border-slate-800/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm việc</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
