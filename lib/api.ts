import axiosInstance from "./axios";
import type {
  ApiResponse,
  DashboardStats,
  HelpTicket,
  HelpTicketsResponse,
  JoinComparisonPoint,
  Subscription,
  SubscriptionPayload,
  Terms,
  User,
  UsersResponse,
} from "./types";

const unwrap = <T>(res: { data: ApiResponse<T> }) => res.data.data;

// ── Auth (public) ─────────────────────────────────────────────────────────────
export const authApi = {
  forgotPassword: async (email: string) =>
    unwrap<null>(await axiosInstance.post("/auth/forgot-password", { email })),

  resetPassword: async (payload: { email: string; code: string; newPassword: string }) =>
    unwrap<null>(await axiosInstance.post("/auth/reset-password", payload)),

  resendVerification: async (email: string) =>
    unwrap<null>(await axiosInstance.post("/auth/resend-verification", { email })),

  changePassword: async (payload: { currentPassword: string; newPassword: string }) =>
    unwrap<null>(await axiosInstance.patch("/auth/change-password", payload)),
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: async () =>
    unwrap<DashboardStats>(await axiosInstance.get("/admin/dashboard/stats")),

  joinComparison: async () =>
    unwrap<JoinComparisonPoint[]>(
      await axiosInstance.get("/admin/dashboard/user-join-comparison")
    ),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    isBanned?: boolean;
    status?: "all" | "paid" | "free";
  }) => unwrap<UsersResponse>(await axiosInstance.get("/admin/users", { params })),

  getById: async (id: string) =>
    unwrap<User>(await axiosInstance.get(`/admin/users/${id}`)),

  toggleBan: async (id: string) =>
    unwrap<{ isBanned: boolean }>(await axiosInstance.patch(`/admin/users/${id}/ban`)),

  remove: async (id: string) =>
    unwrap<null>(await axiosInstance.delete(`/admin/users/${id}`)),
};

// ── Subscriptions ──────────────────────────────────────────────────────────────
export const subscriptionsApi = {
  list: async () =>
    unwrap<Subscription[]>(await axiosInstance.get("/admin/subscriptions")),

  create: async (payload: SubscriptionPayload) =>
    unwrap<Subscription>(await axiosInstance.post("/admin/subscriptions", payload)),

  update: async (id: string, payload: Partial<SubscriptionPayload>) =>
    unwrap<Subscription>(await axiosInstance.patch(`/admin/subscriptions/${id}`, payload)),

  remove: async (id: string) =>
    unwrap<null>(await axiosInstance.delete(`/admin/subscriptions/${id}`)),
};

// ── Terms & Conditions ──────────────────────────────────────────────────────────
export const termsApi = {
  get: async () => unwrap<Terms>(await axiosInstance.get("/admin/terms")),

  update: async (content: string) =>
    unwrap<Terms>(await axiosInstance.put("/admin/terms", { content })),
};

// ── Help & Support ──────────────────────────────────────────────────────────────
export const helpApi = {
  list: async (params: { status?: string; page?: number; limit?: number }) =>
    unwrap<HelpTicketsResponse>(await axiosInstance.get("/admin/help-tickets", { params })),

  updateStatus: async (id: string, status: HelpTicket["status"]) =>
    unwrap<HelpTicket>(await axiosInstance.patch(`/admin/help-tickets/${id}`, { status })),
};

// ── Profile (self) ──────────────────────────────────────────────────────────────
export const profileApi = {
  me: async () => unwrap<User>(await axiosInstance.get("/users/me")),

  update: async (formData: FormData) =>
    unwrap<User>(await axiosInstance.patch("/users/me", formData)),
};
