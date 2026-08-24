"use client";

import React, { useState, useEffect } from "react";
import { Todo, Priority, Status, Subtask } from "@/types";
import {
  X,
  Calendar,
  Clock,
  Bell,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => Promise<void>;
  editingTodo?: Todo | null;
  defaultStatus?: Status;
  initialDate?: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  defaultStatus = "TODO",
  initialDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [autoReminder, setAutoReminder] = useState(true);
  const [subtasks, setSubtasks] = useState<{ id?: number; title: string; is_completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || "");
      setPriority(editingTodo.priority);
      setStatus(editingTodo.status);
      setCategory(editingTodo.category || "General");
      
      if (editingTodo.due_date) {
        try {
          const d = parseISO(editingTodo.due_date);
          setDueDate(format(d, "yyyy-MM-dd'T'HH:mm"));
        } catch {
          setDueDate("");
        }
      } else {
        setDueDate("");
      }

      if (editingTodo.reminder_time) {
        try {
          const r = parseISO(editingTodo.reminder_time);
          setReminderTime(format(r, "yyyy-MM-dd'T'HH:mm"));
          setAutoReminder(false);
        } catch {
          setReminderTime("");
        }
      } else {
        setReminderTime("");
      }

      setSubtasks(
        editingTodo.subtasks?.map((s) => ({
          id: s.id,
          title: s.title,
          is_completed: s.is_completed,
        })) || []
      );
    } else {
      // New task
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus(defaultStatus);
      setCategory("General");
      if (initialDate) {
        setDueDate(format(initialDate, "yyyy-MM-dd'T'09:00"));
      } else {
        setDueDate("");
      }
      setReminderTime("");
      setAutoReminder(true);
      setSubtasks([]);
    }
    setError(null);
  }, [editingTodo, defaultStatus, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), is_completed: false }]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index].is_completed = !updated[index].is_completed;
    setSubtasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề công việc.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        category: category.trim() || "General",
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminder_time: reminderTime ? new Date(reminderTime).toISOString() : null,
        subtasks: subtasks.map((s, idx) => ({
          title: s.title,
          is_completed: s.is_completed,
          order_index: idx,
        })),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Đã có lỗi xảy ra khi lưu công việc.");
    } finally {
      setIsSaving(false);
    }
  };

  const priorities: { id: Priority; label: string; bg: string }[] = [
    { id: "LOW", label: "Thấp", bg: "hover:bg-slate-100 dark:hover:bg-slate-800" },
    { id: "MEDIUM", label: "Trung Bình", bg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/40" },
    { id: "HIGH", label: "Cao", bg: "hover:bg-amber-50 dark:hover:bg-amber-950/40" },
    { id: "URGENT", label: "Khẩn Cấp", bg: "hover:bg-rose-50 dark:hover:bg-rose-950/40" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTodo ? "Chỉnh Sửa Công Việc" : "Tạo Công Việc Mới"}
              </h2>
              <p className="text-xs text-slate-500">
                {editingTodo ? "Cập nhật chi tiết & hẹn giờ nhắc email" : "Thêm việc cần làm vào lịch trình"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Tiêu Đề Công Việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Nộp báo cáo quý 3, Học từ vựng tiếng Anh..."
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Mô Tả Chi Tiết / Ghi Chú
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về yêu cầu, tài liệu tham khảo..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm resize-none"
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Mức Độ Ưu Tiên
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border text-center ${
                      priority === p.id
                        ? p.id === "URGENT"
                          ? "badge-urgent ring-2 ring-rose-500/50"
                          : p.id === "HIGH"
                          ? "badge-high ring-2 ring-amber-500/50"
                          : p.id === "MEDIUM"
                          ? "badge-medium ring-2 ring-indigo-500/50"
                          : "badge-low ring-2 ring-slate-500/50"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 " + p.bg
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Danh Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="General">📁 Chung (General)</option>
                <option value="Work">💼 Công Việc (Work)</option>
                <option value="Personal">🏠 Cá Nhân (Personal)</option>
                <option value="Study">📚 Học Tập (Study)</option>
                <option value="Project">🚀 Dự Án (Project)</option>
              </select>
            </div>
          </div>

          {/* Dates & Reminders */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Cài Đặt Hạn Chót & Tự Động Gửi Email Nhắc Việc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  📅 Hạn Hoàn Thành (Due Date)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ⏰ Giờ Gửi Email Riêng (Tùy chọn)
                </label>
                <input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value);
                    setAutoReminder(false);
                  }}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                id="autoReminder"
                checked={autoReminder}
                onChange={(e) => {
                  setAutoReminder(e.target.checked);
                  if (e.target.checked) setReminderTime("");
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="autoReminder" className="cursor-pointer">
                Tự động gửi email trước deadline theo cài đặt tài khoản (Mặc định trước 30 phút)
              </label>
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Danh Sách Việc Con (Checklist)
            </label>

            {subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={st.is_completed}
                        onChange={() => handleToggleSubtask(idx)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span
                        className={st.is_completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200 font-medium"}
                      >
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Thêm mục việc con..."
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingTodo ? "Lưu Thay Đổi" : "Tạo Công Việc"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
