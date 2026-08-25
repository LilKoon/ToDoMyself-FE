"use client";

import React, { useState, useMemo } from "react";
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
  Layers,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { isPast, isToday, parseISO } from "date-fns";

interface GroupedListViewProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
  onOpenNewTaskModal: () => void;
}

export const GroupedListView: React.FC<GroupedListViewProps> = ({
  todos,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
  onOpenNewTaskModal,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Collapsible state for each section (Default: Active sections open, Completed closed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    overdue: false,
    today: false,
    upcoming: false,
    noDate: false,
    completed: true,
  });

  // Pagination state (Method B)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const areAllCollapsed = Object.values(collapsedSections).every((v) => v);

  const toggleAllSections = () => {
    const nextState = !areAllCollapsed;
    setCollapsedSections({
      overdue: nextState,
      today: nextState,
      upcoming: nextState,
      noDate: nextState,
      completed: nextState,
    });
  };

  // Pagination calculations
  const totalItems = todos.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Ensure currentPage is within bounds
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated slice of todos
  const paginatedTodos = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return todos.slice(start, start + pageSize);
  }, [todos, activePage, pageSize]);

  // Segregate current page's todos into logical smart groups
  const overdueTodos: Todo[] = [];
  const todayTodos: Todo[] = [];
  const upcomingTodos: Todo[] = [];
  const noDateTodos: Todo[] = [];
  const completedTodos: Todo[] = [];

  paginatedTodos.forEach((todo) => {
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

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (totalItems === 0) {
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

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) pages.push("...");
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (activePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Collapse All / Expand All & Items per page */}
      <div className="flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={toggleAllSections}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
        >
          {areAllCollapsed ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mở Rộng Tất Cả Các Nhóm</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Thu Gọn Tất Cả Các Nhóm</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Hiển thị mỗi trang:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={5}>5 việc</option>
            <option value={10}>10 việc</option>
            <option value={20}>20 việc</option>
            <option value={50}>50 việc</option>
          </select>
        </div>
      </div>

      {/* 1. Group: Overdue */}
      {overdueTodos.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("overdue")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {collapsedSections.overdue ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <AlertTriangle className="w-4 h-4" />
              <span>Việc Quá Hạn Cần Làm Gấp</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-[11px] font-extrabold">
              {overdueTodos.length} việc
            </span>
          </button>

          {!collapsedSections.overdue && (
            <div className="space-y-2.5 animate-fade-in pl-1">
              {overdueTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  isExpanded={expandedId === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Group: Today */}
      {todayTodos.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("today")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {collapsedSections.today ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Clock className="w-4 h-4" />
              <span>Việc Hôm Nay</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[11px] font-extrabold">
              {todayTodos.length} việc
            </span>
          </button>

          {!collapsedSections.today && (
            <div className="space-y-2.5 animate-fade-in pl-1">
              {todayTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  isExpanded={expandedId === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Group: Upcoming */}
      {upcomingTodos.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("upcoming")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {collapsedSections.upcoming ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Calendar className="w-4 h-4" />
              <span>Sắp Đến Hạn</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-[11px] font-extrabold">
              {upcomingTodos.length} việc
            </span>
          </button>

          {!collapsedSections.upcoming && (
            <div className="space-y-2.5 animate-fade-in pl-1">
              {upcomingTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  isExpanded={expandedId === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Group: No Date / Flexible */}
      {noDateTodos.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("noDate")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {collapsedSections.noDate ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Layers className="w-4 h-4" />
              <span>Công Việc Linh Hoạt Không Hạn</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold">
              {noDateTodos.length} việc
            </span>
          </button>

          {!collapsedSections.noDate && (
            <div className="space-y-2.5 animate-fade-in pl-1">
              {noDateTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  isExpanded={expandedId === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Group: Completed */}
      {completedTodos.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("completed")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {collapsedSections.completed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã Hoàn Thành</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[11px] font-extrabold">
              {completedTodos.length} việc
            </span>
          </button>

          {!collapsedSections.completed && (
            <div className="space-y-2.5 animate-fade-in pl-1">
              {completedTodos.map((todo) => (
                <TaskRow
                  key={todo.id}
                  todo={todo}
                  isExpanded={expandedId === todo.id}
                  onToggleExpand={() => handleToggleExpand(todo.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* METHOD B: SLEEK NUMBERED PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-bold text-slate-800 dark:text-slate-200">{(activePage - 1) * pageSize + 1}</span> -{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(activePage * pageSize, totalItems)}</span> trên tổng số{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalItems}</span> công việc
          </p>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={activePage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              title="Trang đầu"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Numbered Buttons */}
            {getPageNumbers().map((num, idx) => (
              <React.Fragment key={idx}>
                {num === "..." ? (
                  <span className="px-2 py-1 text-slate-400 text-xs font-bold">...</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Number(num))}
                    className={`min-w-[34px] h-[34px] rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      activePage === num
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={activePage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              title="Trang cuối"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
