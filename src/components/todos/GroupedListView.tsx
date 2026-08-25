"use client";

import React, { useState } from "react";
import { Todo, Status } from "@/types";
import { TaskRow } from "./TaskRow";
import {
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Inbox,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";

interface GroupedListViewProps {
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onOpenNewTaskModal: () => void;
}

export const GroupedListView: React.FC<GroupedListViewProps> = ({
  todos,
  onSelectTodo,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenNewTaskModal,
}) => {
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  if (todos.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Không có công việc nào phù hợp
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Không tìm thấy công việc nào theo bộ lọc hoặc từ khóa hiện tại. Hãy bấm tạo công việc mới để bắt đầu!
        </p>
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          + Tạo Công Việc Ngay
        </button>
      </div>
    );
  }

  // Segregate todos into logical smart groups
  const overdueTodos: Todo[] = [];
  const todayTodos: Todo[] = [];
  const upcomingTodos: Todo[] = [];
  const noDateTodos: Todo[] = [];
  const completedTodos: Todo[] = [];

  todos.forEach((todo) => {
    if (todo.status === "COMPLETED") {
      completedTodos.push(todo);
      return;
    }

    if (!todo.due_date && !todo.start_date) {
      noDateTodos.push(todo);
      return;
    }

    const checkDateStr = todo.due_date || todo.start_date;
    try {
      const d = parseISO(checkDateStr!);
      if (isPast(d) && !isToday(d)) {
        overdueTodos.push(todo);
      } else if (isToday(d)) {
        todayTodos.push(todo);
      } else {
        upcomingTodos.push(todo);
      }
    } catch {
      noDateTodos.push(todo);
    }
  });

  return (
    <div className="space-y-6">
      {/* 1. Group: Overdue */}
      {overdueTodos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider px-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Việc Quá Hạn Cần Làm Gấp ({overdueTodos.length})</span>
          </div>
          <div className="space-y-2">
            {overdueTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onSelectTodo={onSelectTodo}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Group: Today */}
      {todayTodos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider px-1">
            <Clock className="w-4 h-4" />
            <span>Việc Hôm Nay ({todayTodos.length})</span>
          </div>
          <div className="space-y-2">
            {todayTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onSelectTodo={onSelectTodo}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Group: Upcoming */}
      {upcomingTodos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider px-1">
            <Calendar className="w-4 h-4" />
            <span>Sắp Đến Hạn ({upcomingTodos.length})</span>
          </div>
          <div className="space-y-2">
            {upcomingTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onSelectTodo={onSelectTodo}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Group: No Date / Flexible */}
      {noDateTodos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-wider px-1">
            <Layers className="w-4 h-4" />
            <span>Công Việc Linh Hoạt Không Hạn ({noDateTodos.length})</span>
          </div>
          <div className="space-y-2">
            {noDateTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onSelectTodo={onSelectTodo}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Group: Completed (Collapsible) */}
      {completedTodos.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider px-1 hover:text-emerald-700 transition cursor-pointer"
          >
            {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã Hoàn Thành ({completedTodos.length})</span>
          </button>

          {showCompleted && (
            <div className="space-y-2 animate-fade-in">
              {completedTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  onSelectTodo={onSelectTodo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
