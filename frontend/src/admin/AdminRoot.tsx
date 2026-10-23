import { Outlet } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { ToastProvider } from "./ui";
import "./admin.css";

/** Entry for every /admin route: admin styles, toasts, and no public header/footer. */
export default function AdminRoot() {
  return (
    <div className="adm">
      <Seo title="Admin" noIndex />
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </div>
  );
}
