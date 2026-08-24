"use client";

import React from "react";
import { Todo, Status, Priority } from "@/types";
import { TodoCard } from "./TodoCard";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";

interface KanbanBoardProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
  onOpenNewTaskModal: (defaultStatus?: Status) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todos,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
  onOpenNewTaskModal,
}) => {
  const columns: { id: Status; title: string; color: string; bg: string }[] = [
    { id: "TODO", title: "Cần Làm", color: "text-slate-700 dark:text-slate-200", bg: "bg-slate-500/10" },
    { id: "IN_PROGRESS", title: "Đang Thực Hiện", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
    { id: "COMPLETED", title: "Hoàn Thành", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "CANCELLED", title: "Đã Hủy", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      {columns.map((col) => {
        const colTodos = todos.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="glass-panel rounded-3xl p-4 flex flex-col gap-3 min-h-[500px] border border-slate-200/80 dark:border-slate-800/80"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.bg.replace('/10', '')}`} />
                <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  {colTodos.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTaskModal(col.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={`Thêm việc vào cột ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-3 flex-1">
              {colTodos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl text-center">
                  <p className="text-xs text-slate-400">Chưa có việc nào ở cột này</p>
                  <button
                    onClick={() => onOpenNewTaskModal(col.id)}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Tạo việc mới
                  </button>
                </div>
              ) : (
                colTodos.map((todo) => (
                  <div key={todo.id} className="relative group">
                    <TodoCard
                      todo={todo}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onToggleSubtask={onToggleSubtask}
                    />

                    {/* Quick Move Buttons */}
                    <div className="mt-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition px-1">
                      {col.id !== "TODO" && (
                        <button
                          onClick={() => {
                            const prevStatus: Status = col.id === "IN_PROGRESS" ? "TODO" : "IN_PROGRESS";
                            onStatusChange(todo.id, prevStatus);
                          }}
                          className="text-[10px] px-2 py-0.5 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-indigo-500 hover:text-white transition flex items-center gap-0.5"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" /> Lùi
                        </button>
                      )}
                      {col.id !== "COMPLETED" && (
                        <button
                          onClick={() => {
                            const nextStatus: Status = col.id === "TODO" ? "IN_PROGRESS" : "COMPLETED";
                            onStatusChange(todo.id, nextStatus);
                          }}
                          className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-600 hover:text-white transition flex items-center gap-0.5"
                        >
                          Tiến <ArrowRight className="w-2.5 h-2.5" />
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
  );
};
