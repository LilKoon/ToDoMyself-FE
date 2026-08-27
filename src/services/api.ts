import axios from "axios";
import {
  AuthResponse,
  NotificationLog,
  Todo,
  TodoStats,
  User,
  UserNotificationSettings,
} from "@/types";

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
if (rawApiUrl && !rawApiUrl.endsWith("/api/v1")) {
  rawApiUrl = `${rawApiUrl.replace(/\/+$/, "")}/api/v1`;
}
const API_URL = rawApiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("todo_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("todo_refresh_token");
        if (refreshToken) {
          try {
            const res = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });
            if (res.data.access_token) {
              localStorage.setItem("todo_access_token", res.data.access_token);
              if (res.data.refresh_token) {
                localStorage.setItem("todo_refresh_token", res.data.refresh_token);
              }
              api.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            localStorage.removeItem("todo_access_token");
            localStorage.removeItem("todo_refresh_token");
            localStorage.removeItem("todo_user");
            if (!window.location.pathname.startsWith("/login")) {
              window.location.href = "/login";
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },
  register: async (email: string, full_name: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", { email, full_name, password });
    return res.data;
  },
  sendRegisterOTP: async (email: string, full_name: string, password: string): Promise<{ message: string; cooldown_seconds: number; expires_in_seconds: number }> => {
    const res = await api.post<{ message: string; cooldown_seconds: number; expires_in_seconds: number }>("/auth/register/send-otp", { email, full_name, password });
    return res.data;
  },
  verifyRegisterOTP: async (email: string, otp_code: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register/verify-otp", { email, otp_code });
    return res.data;
  },
  resendRegisterOTP: async (email: string): Promise<{ message: string; cooldown_seconds: number; expires_in_seconds: number }> => {
    const res = await api.post<{ message: string; cooldown_seconds: number; expires_in_seconds: number }>("/auth/register/resend-otp", { email });
    return res.data;
  },
  googleAuth: async (id_token: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/google", { id_token });
    return res.data;
  },
  setPassword: async (password: string, setup_token?: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/set-password", { password, setup_token });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
  updateMe: async (data: Partial<User>): Promise<User> => {
    const res = await api.put<User>("/auth/me", data);
    return res.data;
  },
};


// Todo Services
export const todoApi = {
  getTodos: async (params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    filter_type?: string;
  }): Promise<Todo[]> => {
    const res = await api.get<Todo[]>("/todos", { params });
    return res.data;
  },
  getTodo: async (id: number): Promise<Todo> => {
    const res = await api.get<Todo>(`/todos/${id}`);
    return res.data;
  },
  createTodo: async (data: Partial<Todo>): Promise<Todo> => {
    const res = await api.post<Todo>("/todos", data);
    return res.data;
  },
  updateTodo: async (id: number, data: Partial<Todo>): Promise<Todo> => {
    const res = await api.put<Todo>(`/todos/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<Todo> => {
    const res = await api.patch<Todo>(`/todos/${id}/status`, { status });
    return res.data;
  },
  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
  getStats: async (): Promise<TodoStats> => {
    const res = await api.get<TodoStats>("/todos/stats/summary");
    return res.data;
  },
  // Subtasks
  createSubtask: async (todoId: number, title: string): Promise<any> => {
    const res = await api.post(`/todos/${todoId}/subtasks`, { title });
    return res.data;
  },
  updateSubtask: async (subtaskId: number, data: { is_completed?: boolean; title?: string }): Promise<any> => {
    const res = await api.patch(`/todos/subtasks/${subtaskId}`, data);
    return res.data;
  },
  deleteSubtask: async (subtaskId: number): Promise<void> => {
    await api.delete(`/todos/subtasks/${subtaskId}`);
  },
};

// Notification Services
export const notificationApi = {
  getSettings: async (): Promise<UserNotificationSettings> => {
    const res = await api.get<UserNotificationSettings>("/notifications/settings");
    return res.data;
  },
  updateSettings: async (data: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> => {
    const res = await api.put<UserNotificationSettings>("/notifications/settings", data);
    return res.data;
  },
  getLogs: async (): Promise<NotificationLog[]> => {
    const res = await api.get<NotificationLog[]>("/notifications/logs");
    return res.data;
  },
  sendTestEmail: async (targetEmail?: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>("/notifications/test-email", {
      target_email: targetEmail,
    });
    return res.data;
  },
  sendTestDailyDigest: async (): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>("/notifications/test-daily-digest");
    return res.data;
  },
};

export default api;
