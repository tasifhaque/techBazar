const API_BASE = "/api";

// Direct backend URL for serving uploaded files (not proxied by Next.js)
export const BACKEND_URL = "http://localhost:4000";

export interface User {
  id: string;
  name: string;
  email: string;
  gender: "male" | "female";
  avatarUrl: string;
  role: string;
  phone?: string;
  emailVerified?: boolean;
  loginCount?: number;
  orderCount?: number;
  orders?: {
    totalOrders: number;
    totalItems: number;
    totalSpent: number;
  };
  createdAt?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: string;
  brand: string;
  model: string;
  images: string[];
  stock: number;
  featured?: boolean;
  featuredOrder?: number;
  specifications: Record<string, string>;
  createdAt: string;
}



async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status >= 500) console.error(`API ${res.status} ${res.statusText} — ${endpoint} —`, text.slice(0, 200));
    let err;
    try { err = JSON.parse(text); } catch { err = { error: `Request failed (${res.status})` }; }
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: {
    productId: string;
    title: string;
    price: number;
    discountPercentage: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string; gender: string }) =>
      request<{ message: string; email: string; token: string }>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: User }>("/auth/me"),
    updateProfile: (data: { name?: string; phone?: string }) =>
      request<{ user: User }>("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
    regenerateAvatar: () => request<{ user: User }>("/auth/avatar", { method: "PUT" }),
    deleteAccount: () => request<{ message: string }>("/auth/account", { method: "DELETE" }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>("/auth/password", { method: "PUT", body: JSON.stringify(data) }),
    verifyEmail: (email: string, code: string, token: string) =>
      request<{ message: string; user: User; emailVerified: boolean }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code, token }) }),
    resendCode: (email: string, token: string) =>
      request<{ message: string; token?: string }>("/auth/resend-code", { method: "POST", body: JSON.stringify({ email, token }) }),
    verificationStatus: (email: string) =>
      request<{ emailVerified: boolean }>(`/auth/verification-status?email=${encodeURIComponent(email)}`),
    forgotPassword: (email: string) =>
      request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (email: string, code: string, newPassword: string) =>
      request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) }),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ products: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/products${qs}`);
    },
    get: (category: string, brand: string, model: string) =>
      request<{ product: Product }>(`/products/${category}/${brand}/${model}`),
    categories: () => request<{ categories: string[] }>("/products/categories"),
    brands: (category?: string) => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      return request<{ brands: string[] }>(`/products/brands${qs}`);
    },
  },
  settings: {
    get: () => request<{ siteName: string }>("/settings"),
    update: (data: { siteName: string }) =>
      request<{ siteName: string }>("/settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  orders: {
    create: (data: {
      items: { productId: string; quantity: number }[];
      shippingAddress: { fullName: string; address: string; city: string; state: string; zipCode: string; phone: string };
      paymentMethod: string;
    }) => request<{ order: Order }>("/orders", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<{ orders: Order[] }>("/orders"),
    get: (id: string) => request<{ order: Order }>(`/orders/${id}`),
  },
  admin: {
    stats: () =>
      request<{ totalProducts: number; totalUsers: number; lowStock: number; categories: number; lowStockProducts: { title: string; stock: number; price: number; category: string; brand: string }[] }>("/admin/stats"),
    activity: () =>
      request<{ recentOrders: any[]; recentUsers: any[]; recentProducts: any[] }>("/admin/activity"),
    categories: () =>
      request<{ categories: string[]; brands: string[] }>("/admin/categories"),
    createProduct: (data: {
      title: string;
      description: string;
      price: number;
      discountPercentage?: number;
      category: string;
      brand: string;
      model: string;
      images?: string[];
      stock?: number;
      specifications?: Record<string, string>;
    }) =>
      request<{ product: Product }>("/admin/products", { method: "POST", body: JSON.stringify(data) }),
    listUsers: (params?: { search?: string; page?: string; limit?: string }) => {
      const qs = params ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))).toString() : "";
      return request<{ users: User[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/admin/users${qs}`);
    },
    getUser: (id: string) =>
      request<{ user: User }>(`/admin/users/${id}`),
    getUserOrders: (id: string) =>
      request<{ orders: Order[] }>(`/admin/users/${id}/orders`),
    deleteUser: (id: string) =>
      request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),
    updateProduct: (id: string, data: {
      title?: string;
      description?: string;
      price?: number;
      discountPercentage?: number;
      category?: string;
      brand?: string;
      model?: string;
      images?: string[];
      stock?: number;
      featured?: boolean;
      featuredOrder?: number;
      specifications?: Record<string, string>;
    }) =>
      request<{ product: Product }>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProduct: (id: string) =>
      request<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" }),
    updateAdminProfile: (data: { name?: string; email?: string }) =>
      request<{ user: User }>("/admin/profile", { method: "PUT", body: JSON.stringify(data) }),
    changeAdminPassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>("/admin/password", { method: "PUT", body: JSON.stringify(data) }),
    deleteAdminAccount: (data: { password: string }) =>
      request<{ message: string }>("/admin/account", { method: "DELETE", body: JSON.stringify(data) }),
  },
};

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  lowStock: number;
  categories: number;
  lowStockProducts: { title: string; stock: number; price: number; category: string; brand: string }[];
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
