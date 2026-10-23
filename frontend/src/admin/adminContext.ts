import { createContext, useContext } from "react";
import type { AdminUser } from "./authService";

export interface AuthState {
  admin: AdminUser | null;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({ admin: null, logout: async () => {} });
export const useAdmin = () => useContext(AuthContext);

export type ToastTone = "success" | "error" | "info";
export const ToastContext = createContext<(text: string, tone?: ToastTone) => void>(() => {});
export const useToast = () => useContext(ToastContext);
