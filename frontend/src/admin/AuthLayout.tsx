import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

const ART = "/media/client-2026/pcci-meet/1TELjtYX0OUg2sCDG-Gj2lfNbQd4HokFX-md.webp";

/** Split-screen frame for the login and registration pages. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="a-auth">
      <aside className="a-auth__art" style={{ ["--a-art" as string]: `url(${ART})` }} aria-hidden="true">
        <div className="a-auth__brand">
          <img src="/brand/jmj-logo-128.webp" srcSet="/brand/jmj-logo-128.webp 1x, /brand/jmj-logo-256.webp 2x" alt="" width={46} height={46} />
          <div>
            <strong>Congregation of Jesus Mary Joseph</strong>
            <span>Hyderabad Province</span>
          </div>
        </div>
        <div>
          <h2>Share the Province&rsquo;s story, one update at a time.</h2>
          <p>Publish news, post notices and manage photographs for the JMJ Hyderabad Province website.</p>
        </div>
        <div className="a-auth__features">
          <div><Icon name="news" /> News articles with drafts and publishing</div>
          <div><Icon name="bell" /> Notices with urgency levels</div>
          <div><Icon name="image" /> Photo uploads with categories</div>
        </div>
      </aside>
      <div className="a-auth__panel">
        <div className="a-auth__card">
          <div className="a-auth__brand">
            <img src="/brand/jmj-logo-128.webp" srcSet="/brand/jmj-logo-128.webp 1x, /brand/jmj-logo-256.webp 2x" alt="" width={46} height={46} />
            <div>
              <strong>JMJ Admin</strong>
              <span>Hyderabad Province</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  disabled,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <ShowHide>
      {(show, toggle) => (
        <div className="a-pw">
          <input
            id={id}
            className="a-input"
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            required
            disabled={disabled}
            aria-invalid={invalid || undefined}
          />
          <button type="button" className="a-icon-btn" onClick={toggle} aria-label={show ? "Hide password" : "Show password"}>
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        </div>
      )}
    </ShowHide>
  );
}

function ShowHide({ children }: { children: (show: boolean, toggle: () => void) => ReactNode }) {
  const [show, setShow] = useState(false);
  return <>{children(show, () => setShow((v) => !v))}</>;
}
