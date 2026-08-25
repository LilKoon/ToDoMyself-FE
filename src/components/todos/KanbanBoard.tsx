"use client";

import React from "react";
import { Todo, Status } from "@/types";
import { TodoCard } from "./TodoCard";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";

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
  const columns: { id: Status; title: string; color: string; badgeBg: string; border: string }[] = [
    {
      id: "TODO",
      title: "Cần Làm",
      color: "text-slate-800 dark:text-slate-200",
      badgeBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      border: "border-slate-300/80 dark:border-slate-700/80",
    },
    {
      id: "IN_PROGRESS",
      title: "Đang Thực Hiện",
      color: "text-indigo-600 dark:text-indigo-400",
      badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-400/40 dark:border-indigo-500/30",
    },
    {
      id: "COMPLETED",
      title: "Hoàn Thành",
      color: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-400/40 dark:border-emerald-500/30",
    },
    {
      id: "CANCELLED",
      title: "Đã Hủy",
      color: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      border: "border-rose-400/40 dark:border-rose-500/30",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTodos = todos.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`glass-panel rounded-3xl p-5 flex flex-col gap-4 min-h-[550px] border ${col.border} shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <h3 className={`font-black text-base tracking-tight ${col.color}`}>{col.title}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                    {colTodos.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewTaskModal(col.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title={`Thêm công việc vào cột ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex flex-col gap-3 flex-1">
                {colTodos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 font-medium">Chưa có công việc ở mục này</p>
                    <button
                      onClick={() => onOpenNewTaskModal(col.id)}
                      className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Tạo việc mới
                    </button>
                  </div>
                ) : (
                  colTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="relative group cursor-pointer"
                      onClick={() => onSelectTodo(todo)}
                    >
                      <TodoCard
                        todo={todo}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                        onToggleSubtask={onToggleSubtask}
                      />

                      {/* Quick Move Buttons */}
                      <div
                        className="mt-1 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition px-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {col.id !== "TODO" && (
                          <button
                            onClick={() => {
                              const prevStatus: Status =
                                col.id === "CANCELLED"
                                  ? "COMPLETED"
                                  : col.id === "COMPLETED"
                                  ? "IN_PROGRESS"
                                  : "TODO";
                              onStatusChange(todo.id, prevStatus);
                            }}
                            className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-500 hover:text-white transition flex items-center gap-1 font-semibold cursor-pointer shadow-sm"
                          >
                            <ArrowLeft className="w-3 h-3" /> Lùi
                          </button>
                        )}
                        {col.id !== "COMPLETED" && col.id !== "CANCELLED" && (
                          <button
                            onClick={() => {
                              const nextStatus: Status = col.id === "TODO" ? "IN_PROGRESS" : "COMPLETED";
                              onStatusChange(todo.id, nextStatus);
                            }}
                            className="text-[11px] px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-600 hover:text-white transition flex items-center gap-1 font-semibold cursor-pointer shadow-sm"
                          >
                            Tiến <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
