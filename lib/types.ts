// Backend response envelope: { statusCode, success, message, data }
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  accountType: "user" | "admin";
  isVerified: boolean;
  isBanned: boolean;
  subscriptionStatus: "paid" | "free";
  totalSpent: number;
  subscribedAt?: string | null;
  postsCount: number;
  tripsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalTrips: number;
  totalPlaces: number;
  totalReviews: number;
  newUsersToday: number;
  newPostsToday: number;
  paidUsers: number;
  freeUsers: number;
  totalEarnings: number;
  usersThisMonth: number;
  usersLastMonth: number;
  usersGrowthPct: number;
}

export interface JoinComparisonPoint {
  day: number;
  thisMonth: number;
  lastMonth: number;
}

export interface Subscription {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  searchLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPayload = Omit<
  Subscription,
  "_id" | "createdAt" | "updatedAt"
>;

export interface Terms {
  _id: string;
  type: string;
  content: string;
  updatedAt: string;
}

export interface HelpTicket {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

export interface HelpTicketsResponse {
  tickets: HelpTicket[];
  total: number;
  page: number;
}
