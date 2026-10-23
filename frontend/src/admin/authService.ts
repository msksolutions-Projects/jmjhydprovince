import adminApi from "./adminApi";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  organization?: string;
  lastLogin?: string;
}

export const authService = {
  async login(email: string, password: string) {
    const { data } = await adminApi.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("admin_token", data.token);
    }
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const { data } = await adminApi.post("/auth/register", {
      ...payload,
      organization: "JMJ Hyderabad Province",
    });
    if (data.token) {
      localStorage.setItem("admin_token", data.token);
    }
    return data;
  },

  async verify() {
    const { data } = await adminApi.get("/auth/verify");
    return data;
  },

  async logout() {
    try {
      await adminApi.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("admin_token");
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem("admin_token"));
  },
};

export default authService;