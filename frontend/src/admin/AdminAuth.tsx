import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import authService, { type AdminUser } from "./authService";
import { AuthContext } from "./adminContext";


/** Verifies the saved token once for the whole admin area. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<"checking" | "ok" | "denied">(authService.isLoggedIn() ? "checking" : "denied");

  useEffect(() => {
    if (status !== "checking") return;
    authService
      .verify()
      .then((res) => {
        if (res?.success) {
          setAdmin(res.admin ?? null);
          setStatus("ok");
        } else setStatus("denied");
      })
      .catch(() => setStatus("denied"));
  }, [status]);

  const logout = useCallback(async () => {
    await authService.logout();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  if (status === "denied") return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (status === "checking")
    return (
      <div className="a-center" role="status" aria-label="Checking your session">
        <span className="a-spin a-spin--dark" />
      </div>
    );
  return <AuthContext.Provider value={{ admin, logout }}>{children}</AuthContext.Provider>;
}
