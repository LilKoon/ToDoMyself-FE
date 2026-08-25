"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Todo, TodoStats, Status, Priority } from "@/types";
import { todoApi } from "@/services/api";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, ViewMode } from "@/components/layout/Sidebar";
import { StatsBanner } from "@/components/todos/StatsBanner";
import { GroupedListView } from "@/components/todos/GroupedListView";
import { KanbanBoard } from "@/components/todos/KanbanBoard";
import { CalendarView } from "@/components/todos/CalendarView";
import { TaskModal } from "@/components/todos/TaskModal";
import { TaskDetailDrawer } from "@/components/todos/TaskDetailDrawer";
import { Toast, ToastType } from "@/components/common/Toast";




import {
  Plus,
  Filter,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Sparkles,
  Loader2,
  Inbox,
  AlertTriangle,
  Clock,
  Search,
  History,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View & Filter states
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [includePast, setIncludePast] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");


  // Modal & Drawer states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodoForDetail, setSelectedTodoForDetail] = useState<Todo | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<Status>("TODO");
  const [initialModalDate, setInitialModalDate] = useState<Date | undefined>(undefined);

  // Toast state
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ isOpen: true, message, type });
  };

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch todos and stats
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [todosData, statsData] = await Promise.all([
        todoApi.getTodos({
          category: activeCategory !== "All" ? activeCategory : undefined,
          search: searchQuery.trim() ? searchQuery.trim() : undefined,
          filter_type: includePast ? undefined : (activeFilter !== "all" ? activeFilter : undefined),
        }),
        todoApi.getStats(),
      ]);
      setTodos(todosData);
      setStats(statsData);

      // Keep open drawer updated without triggering re-fetch loop
      setSelectedTodoForDetail((prev) => {
        if (!prev) return null;
        return todosData.find((t) => t.id === prev.id) || null;
      });
    } catch (err) {
      console.error("Failed to load todos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeCategory, searchQuery, activeFilter, includePast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handlers
  const handleOpenCreateModal = (status: Status = "TODO", initialDate?: Date) => {
    setSelectedTodoForDetail(null);
    setEditingTodo(null);
    setDefaultModalStatus(status);
    setInitialModalDate(initialDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setSelectedTodoForDetail(null);
    setEditingTodo(todo);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTodo) {
      await todoApi.updateTodo(editingTodo.id, taskData);
      showToast("Cập nhật công việc thành công!", "success");
    } else {
      await todoApi.createTodo(taskData);
      showToast("Tạo công việc mới thành công!", "success");
    }
    setSelectedTodoForDetail(null);
    fetchData();
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      try {
        await todoApi.deleteTodo(id);
        showToast("Đã xóa công việc", "info");
        if (selectedTodoForDetail?.id === id) {
          setSelectedTodoForDetail(null);
        }
        fetchData();
      } catch (err) {
        showToast("Không thể xóa công việc", "error");
      }
    }
  };

  const handleStatusChange = async (id: number, status: Status) => {
    try {
      const updated = await todoApi.updateStatus(id, status);
      if (selectedTodoForDetail?.id === id) {
        setSelectedTodoForDetail(updated);
      }
      fetchData();
    } catch (err) {
      showToast("Không thể đổi trạng thái", "error");
    }
  };

  const handleToggleSubtask = async (subtaskId: number, isCompleted: boolean) => {
    try {
      await todoApi.updateSubtask(subtaskId, { is_completed: isCompleted });
      fetchData();
    } catch (err) {
      showToast("Không thể cập nhật việc con", "error");
    }
  };

  // Filter todos by priority
  const displayTodos = todos.filter((t) => {
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải Todo Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTaskModal={() => handleOpenCreateModal("TODO")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Spacious Container */}
      <div className="flex-1 max-w-[1720px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setSelectedTodoForDetail(null);
            setViewMode(mode);
          }}
          activeFilter={activeFilter}
          onFilterChange={(filter) => {
            setSelectedTodoForDetail(null);
            setActiveFilter(filter);
          }}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setSelectedTodoForDetail(null);
            setActiveCategory(cat);
          }}
          stats={
            stats
              ? {
                  total: stats.total_todos,
                  dueToday: stats.due_today_todos,
                  upcoming24h: stats.upcoming_24h_todos,
                  overdue: stats.overdue_todos,
                }
              : undefined
          }
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Top Metric Stats */}
          <StatsBanner stats={stats} />

          {/* View Header & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeFilter === "all"
                  ? "Tất Cả Công Việc"
                  : activeFilter === "today"
                  ? "Công Việc Hôm Nay"
                  : activeFilter === "upcoming"
                  ? "Sắp Đến Hạn (Trong 24h Tới)"
                  : activeFilter === "overdue"
                  ? "Việc Quá Hạn Cần Làm Ngay"
                  : "Việc Đã Hoàn Thành"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeCategory !== "All" ? `Danh mục: ${activeCategory} • ` : ""}
                Hiển thị {displayTodos.length} công việc
                {priorityFilter !== "ALL" && ` (Ưu tiên: ${priorityFilter})`}
                {includePast && " • Đang bật tìm cả việc quá khứ"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenCreateModal("TODO")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Công Việc Mới</span>
              </button>
            </div>
          </div>

          {/* Dedicated Filter & Search Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh theo tên công việc, ghi chú, việc con..."
                className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Xóa từ khóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions: Past Search Toggle & Priority Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Include Past Tasks Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !includePast;
                  setIncludePast(next);
                  if (next) {
                    setActiveFilter("all");
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  includePast
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-xs"
                    : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
                title="Bao gồm cả các công việc đã hoàn thành hoặc hủy trong quá khứ khi tìm kiếm"
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span>Tìm việc quá khứ</span>
                {includePast && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" />}
              </button>

              {/* Priority Filter Selector */}
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                {(["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((pri) => (
                  <button
                    type="button"
                    key={pri}
                    onClick={() => setPriorityFilter(pri)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      priorityFilter === pri
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {pri === "ALL"
                      ? "Tất cả"
                      : pri === "URGENT"
                      ? "Khẩn cấp"
                      : pri === "HIGH"
                      ? "Cao"
                      : pri === "MEDIUM"
                      ? "TB"
                      : "Thấp"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Loading */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500">Đang tải danh sách công việc...</p>
            </div>
          ) : (
            <>
              {/* View 1: Grouped List View (Linear / Notion style) */}
              {viewMode === "list" && (
                <GroupedListView
                  todos={displayTodos}
                  onSelectTodo={(t) => setSelectedTodoForDetail(t)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onOpenNewTaskModal={() => handleOpenCreateModal("TODO")}
                />
              )}


              {/* View 2: Kanban Board View */}
              {viewMode === "kanban" && (
                <KanbanBoard
                  todos={displayTodos}
                  onSelectTodo={(t) => setSelectedTodoForDetail(t)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onToggleSubtask={handleToggleSubtask}
                  onOpenNewTaskModal={(colStatus) => handleOpenCreateModal(colStatus)}
                />
              )}

              {/* View 3: Calendar View */}
              {viewMode === "calendar" && (
                <CalendarView
                  todos={displayTodos}
                  selectedTodo={selectedTodoForDetail}
                  onSelectTodo={(t) => setSelectedTodoForDetail(t)}
                  onCloseDetail={() => setSelectedTodoForDetail(null)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onToggleSubtask={handleToggleSubtask}
                  onOpenNewTaskModal={(status, date) => handleOpenCreateModal(status, date)}
                />
              )}
            </>
          )}
        </main>
      </div>


      {/* Task Detail Slide-Over Drawer for List & Kanban views */}
      {viewMode !== "calendar" && (
        <TaskDetailDrawer
          isOpen={!!selectedTodoForDetail && !isTaskModalOpen}
          todo={selectedTodoForDetail}
          onClose={() => setSelectedTodoForDetail(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onToggleSubtask={handleToggleSubtask}
        />
      )}


      {/* Task Create/Edit Modal */}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTodo={editingTodo}
        defaultStatus={defaultModalStatus}
        initialDate={initialModalDate}
      />

      {/* Global Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
