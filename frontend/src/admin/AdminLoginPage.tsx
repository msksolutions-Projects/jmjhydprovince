import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import authService from "./authService";
import { AuthLayout, PasswordInput } from "./AuthLayout";
import { apiError } from "./utils";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      if (result.success) navigate(from, { replace: true });
      else setError(result.message || "Login failed. Check your email and password.");
    } catch (err) {
      setError(apiError(err, "Unable to log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Welcome back</h1>
      <p>Sign in to manage the Province website.</p>
      <form className="a-form" onSubmit={handleSubmit} noValidate={false}>
        {error && (
          <div className="a-alert a-alert--error" role="alert">
            <Icon name="alert" />
            <span>{error}</span>
          </div>
        )}
        <div className="a-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="a-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="you@example.com" />
        </div>
        <div className="a-field">
          <label htmlFor="login-password">Password</label>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" disabled={loading} />
        </div>
        <button type="submit" className="a-btn a-btn--lg a-btn--block" disabled={loading}>
          {loading ? <span className="a-spin" /> : <Icon name="lock" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="a-auth__foot">
        <span>Authorised administrators only.</span>
        <span>
          First-time setup? <Link to="/admin/register">Create an admin account</Link>
        </span>
        <a href="/">← Back to the website</a>
      </div>
    </AuthLayout>
  );
}
