import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import adminApi from "./adminApi";
import { useAdmin, useToast } from "./adminContext";
import { PasswordInput } from "./AuthLayout";
import { apiError, initials, passwordScore } from "./utils";

export function AdminAccountPage() {
  const { admin } = useAdmin();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const score = passwordScore(form.newPassword);
  const mismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 8) return setError("The new password must be at least 8 characters.");
    if (form.newPassword !== form.confirmPassword) return setError("The new passwords do not match.");
    setSaving(true);
    try {
      await adminApi.post("/auth/change-password", form);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password changed");
    } catch (err) {
      setError(apiError(err, "Could not change the password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Account</h1>
          <p>Your administrator profile and password.</p>
        </div>
      </div>
      <div className="a-grid-2">
        <section className="a-card" aria-labelledby="pw-title">
          <div className="a-card__head">
            <h2 id="pw-title">Change password</h2>
          </div>
          <form className="a-card__body a-form" onSubmit={submit} style={{ maxWidth: 480 }}>
            {error && (
              <div className="a-alert a-alert--error" role="alert"><Icon name="alert" /><span>{error}</span></div>
            )}
            <div className="a-field">
              <label htmlFor="pw-current">Current password</label>
              <PasswordInput id="pw-current" value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" disabled={saving} />
            </div>
            <div className="a-field">
              <label htmlFor="pw-new">New password <small>At least 8 characters</small></label>
              <PasswordInput id="pw-new" value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" disabled={saving} />
              <div className="a-strength" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => <span key={n} className={n <= score ? `on s${score}` : ""} />)}
              </div>
            </div>
            <div className="a-field">
              <label htmlFor="pw-confirm">Confirm new password</label>
              <PasswordInput id="pw-confirm" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" disabled={saving} invalid={mismatch} />
              {mismatch && <span className="a-hint is-bad">Passwords do not match yet.</span>}
            </div>
            <div>
              <button type="submit" className="a-btn" disabled={saving}>
                {saving ? <span className="a-spin" /> : <Icon name="lock" />} {saving ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </section>
        <section className="a-card" aria-labelledby="profile-title">
          <div className="a-card__head">
            <h2 id="profile-title">Profile</h2>
          </div>
          <div className="a-card__body">
            <div className="a-msg-meta">
              <span className="a-avatar a-avatar--lg" aria-hidden="true">{initials(admin?.name)}</span>
              <div>
                <strong>{admin?.name}</strong>
                <div className="a-hint">{admin?.email}</div>
                {admin?.role && <span className="a-pill a-pill--plain medium" style={{ marginTop: 6 }}>{admin.role.replace("_", " ")}</span>}
              </div>
            </div>
            <p className="a-hint" style={{ marginTop: 16 }}>
              Forgotten password or locked out? On the server run{" "}
              <code>npm run create-admin -- &quot;Name&quot; email &quot;NewPassword&quot;</code> to reset it.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
