export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Status = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Subtask {
  id: number;
  todo_id: number;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  status: Status;
  category: string;
  due_date?: string | null;
  reminder_time?: string | null;
  is_reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  timezone: string;
  auth_provider: string;
  is_active: boolean;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationSettings {
  id: number;
  user_id: number;
  email_notifications_enabled: boolean;
  remind_before_minutes: number;
  daily_summary_enabled: boolean;
  daily_summary_time: string;
  last_daily_digest_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: number;
  user_id: number;
  todo_id?: number | null;
  notification_type: "TASK_REMINDER" | "DAILY_DIGEST" | "DUE_SOON" | "TEST_EMAIL";
  status: "SENT" | "FAILED";
  recipient_email: string;
  subject: string;
  error_message?: string | null;
  sent_at: string;
}

export interface TodoStats {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  in_progress_todos: number;
  overdue_todos: number;
  due_today_todos: number;
  upcoming_24h_todos: number;
  completion_rate: number;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type: string;
  needs_password_setup: boolean;
  setup_token?: string;
  user?: User;
  message?: string;
}
