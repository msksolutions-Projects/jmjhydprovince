import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import authService from "./authService";
import { AuthLayout, PasswordInput } from "./AuthLayout";
import { apiError, passwordScore } from "./utils";

export function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const score = passwordScore(form.password);
  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const result = await authService.register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      if (result.success) navigate("/admin/dashboard", { replace: true });
      else setError(result.message || "Registration failed.");
    } catch (err) {
      setError(apiError(err, "Unable to register."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Create admin account</h1>
      <p>First-time setup for the JMJ Hyderabad Province website.</p>
      <form className="a-form" onSubmit={handleSubmit}>
        {error && (
          <div className="a-alert a-alert--error" role="alert">
            <Icon name="alert" />
            <span>{error}</span>
          </div>
        )}
        <div className="a-field">
          <label htmlFor="reg-name">Full name</label>
          <input id="reg-name" className="a-input" value={form.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" required disabled={loading} />
        </div>
        <div className="a-row-2">
          <div className="a-field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" className="a-input" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} autoComplete="email" required disabled={loading} />
          </div>
          <div className="a-field">
            <label htmlFor="reg-phone">Phone <small>Optional</small></label>
            <input id="reg-phone" className="a-input" type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} autoComplete="tel" disabled={loading} />
          </div>
        </div>
        <div className="a-field">
          <label htmlFor="reg-password">Password <small>At least 8 characters</small></label>
          <PasswordInput id="reg-password" value={form.password} onChange={set("password")} autoComplete="new-password" disabled={loading} />
          <div className="a-strength" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={n <= score ? `on s${score}` : ""} />
            ))}
          </div>
        </div>
        <div className="a-field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <PasswordInput id="reg-confirm" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" disabled={loading} invalid={mismatch} />
          {mismatch && <span className="a-hint is-bad">Passwords do not match yet.</span>}
        </div>
        <button type="submit" className="a-btn a-btn--lg a-btn--block" disabled={loading}>
          {loading ? <span className="a-spin" /> : <Icon name="user" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className="a-auth__foot">
        <span>
          Already have an account? <Link to="/admin/login">Sign in</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
