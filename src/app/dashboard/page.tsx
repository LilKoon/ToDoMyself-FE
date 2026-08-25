"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Todo, TodoStats, Status, Priority } from "@/types";
import { todoApi } from "@/services/api";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, ViewMode } from "@/components/layout/Sidebar";
import { StatsBanner } from "@/components/todos/StatsBanner";
import { TodoCard } from "@/components/todos/TodoCard";
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
          filter_type: activeFilter !== "all" ? activeFilter : undefined,
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
  }, [isAuthenticated, activeCategory, searchQuery, activeFilter]);


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

          {/* View Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
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
                Hiển thị {todos.length} công việc
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenCreateModal("TODO")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Công Việc Mới</span>
              </button>
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
              {/* View 1: List View */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {todos.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Không có công việc nào
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                        Hiện tại không có công việc nào trong bộ lọc này. Hãy bấm tạo công việc mới để bắt đầu!
                      </p>
                      <button
                        onClick={() => handleOpenCreateModal("TODO")}
                        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                      >
                        + Tạo Công Việc Ngay
                      </button>
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onSelectTodo={(t) => setSelectedTodoForDetail(t)}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        onToggleSubtask={handleToggleSubtask}
                      />
                    ))
                  )}
                </div>
              )}

              {/* View 2: Kanban Board View */}
              {viewMode === "kanban" && (
                <KanbanBoard
                  todos={todos}
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
                  todos={todos}
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
