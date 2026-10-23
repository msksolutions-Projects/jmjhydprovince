import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("./adminApi", () => ({ default: api, adminApi: api }));

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  verify: vi.fn(),
  logout: vi.fn(),
  isLoggedIn: vi.fn(),
}));
vi.mock("./authService", () => ({ default: auth, authService: auth }));

import AdminRoot from "./AdminRoot";
import AdminLayout from "./AdminLayout";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { AdminNewsPage } from "./AdminNewsPage";

const news = [
  { _id: "n1", title: "Feast day celebrations", excerpt: "A joyful day", content: "x".repeat(120), category: "celebrations", status: "published", createdAt: "2026-10-01T10:00:00Z" },
  { _id: "n2", title: "Draft about schools", excerpt: "Work in progress", content: "y".repeat(120), category: "education", status: "draft", createdAt: "2026-10-05T10:00:00Z" },
];

function renderAdmin(path: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="news" element={<AdminNewsPage />} />
        </Route>
      </Route>
    </Routes>,
    { initialEntries: [path] },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.isLoggedIn.mockReturnValue(true);
  auth.verify.mockResolvedValue({ success: true, admin: { id: "1", name: "Sr. Mary Joseph", email: "mary@example.com", role: "admin" } });
  api.get.mockImplementation((path: string) =>
    Promise.resolve({ data: { data: path === "/news" ? news : [] } }),
  );
});

describe("Admin area", () => {
  it("sends visitors without a session to the login page", async () => {
    auth.isLoggedIn.mockReturnValue(false);
    renderAdmin("/admin/dashboard");
    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(auth.verify).not.toHaveBeenCalled();
  });

  it("shows a login error from the server", async () => {
    const user = userEvent.setup();
    auth.isLoggedIn.mockReturnValue(false);
    auth.login.mockResolvedValue({ success: false, message: "Invalid credentials" });
    renderAdmin("/admin/login");
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("signs in and opens the dashboard", async () => {
    const user = userEvent.setup();
    auth.isLoggedIn.mockReturnValue(false);
    auth.login.mockImplementation(async () => {
      auth.isLoggedIn.mockReturnValue(true);
      return { success: true };
    });
    renderAdmin("/admin/login");
    await user.type(screen.getByLabelText("Email"), "mary@example.com");
    await user.type(screen.getByLabelText("Password"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("heading", { name: /good (morning|afternoon|evening), mary$/i })).toBeInTheDocument();
  });

  it("summarises content on the dashboard", async () => {
    renderAdmin("/admin/dashboard");
    const stat = await screen.findByRole("link", { name: /news articles/i });
    await waitFor(() => expect(stat).toHaveTextContent("2"));
    expect(stat).toHaveTextContent("1 published");
    expect(screen.getByText(/1 draft waiting/i)).toBeInTheDocument();
    expect(screen.getByText("Feast day celebrations")).toBeInTheDocument();
    const sidebar = screen.getByRole("complementary", { name: /admin navigation/i });
    expect(within(sidebar).getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  });

  it("filters news by status", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/news");
    const tabs = await screen.findByRole("tablist", { name: /filter by status/i });
    await screen.findAllByText("Feast day celebrations");
    await user.click(within(tabs).getByRole("tab", { name: /drafts/i }));
    expect(screen.queryAllByText("Feast day celebrations")).toHaveLength(0);
    expect(screen.getAllByText("Draft about schools").length).toBeGreaterThan(0);
  });

  it("validates and saves a new article", async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    renderAdmin("/admin/news?new=1");
    const editor = await screen.findByRole("dialog", { name: /new article/i });
    await user.type(within(editor).getByLabelText("Title"), "Province retreat");
    await user.type(within(editor).getByLabelText(/summary/i), "Annual retreat for sisters");
    await user.type(within(editor).getByLabelText("Article"), "Too short");
    await user.click(screen.getByRole("button", { name: /^publish$/i }));
    expect(await within(editor).findByRole("alert")).toHaveTextContent(/at least 100/i);
    expect(api.post).not.toHaveBeenCalled();

    await user.type(within(editor).getByLabelText("Article"), " — " + "detail ".repeat(20));
    await user.click(screen.getByRole("button", { name: /^publish$/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/news", expect.objectContaining({ title: "Province retreat", status: "published" }), undefined));
    expect(await screen.findByText(/article published/i)).toBeInTheDocument();
  });

  it("asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    api.delete.mockResolvedValue({ data: { success: true } });
    renderAdmin("/admin/news");
    const [button] = await screen.findAllByRole("button", { name: /delete feast day celebrations/i });
    await user.click(button!);
    const dialog = screen.getByRole("alertdialog", { name: /delete this article/i });
    await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/news/n1"));
    await waitFor(() => expect(screen.queryAllByText("Feast day celebrations")).toHaveLength(0));
  });

  it("uploads a file to an article and removes cancelled uploads", async () => {
    const user = userEvent.setup();
    const pdf = { name: "Circular 5.pdf", url: "/uploads/circular-5.pdf", kind: "pdf", size: 52000, publicId: "circular-5.pdf", resourceType: "local" };
    api.post.mockImplementation((path: string) =>
      Promise.resolve({ data: path === "/uploads" ? { success: true, data: pdf } : { success: true } }),
    );
    api.delete.mockResolvedValue({ data: { success: true } });
    renderAdmin("/admin/news?new=1");
    const editor = await screen.findByRole("dialog", { name: /new article/i });
    await user.upload(within(editor).getByLabelText(/attachments/i), new File(["%PDF"], "Circular 5.pdf", { type: "application/pdf" }));
    expect(await within(editor).findByRole("link", { name: "Circular 5.pdf" })).toBeInTheDocument();
    expect(within(editor).getByText("51 KB")).toBeInTheDocument();

    await user.type(within(editor).getByLabelText("Title"), "Province circular");
    await user.type(within(editor).getByLabelText(/summary/i), "Circular attached");
    await user.type(within(editor).getByLabelText("Article"), "detail ".repeat(20));
    await user.click(screen.getByRole("button", { name: /^publish$/i }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/news", expect.objectContaining({ attachments: [pdf] }), undefined),
    );
    expect(api.delete).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole("button", { name: /new article/i })[0]!);
    const again = await screen.findByRole("dialog", { name: /new article/i });
    await user.upload(within(again).getByLabelText(/attachments/i), new File(["%PDF"], "Circular 5.pdf", { type: "application/pdf" }));
    await within(again).findByRole("link", { name: "Circular 5.pdf" });
    await user.click(within(again).getByRole("button", { name: /^cancel$/i }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/uploads", { data: { publicId: "circular-5.pdf", resourceType: "local" } }));
  });
});
