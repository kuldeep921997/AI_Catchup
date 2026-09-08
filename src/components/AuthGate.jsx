import { useState } from "react";

// Gate shown whenever there is no active session. Local-only accounts: there
// is no server, so this exists to let more than one person use the same
// browser without seeing each other's tracker progress — not to protect
// anything sensitive. See useAuth.js for exactly what that does and does not
// guarantee.
export default function AuthGate({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      const action = mode === "login" ? onLogin : onRegister;
      const result = await action(email, password);
      if (!result.ok) setError(result.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <p className="font-mono text-xs text-accent2 tracking-widest mb-3">LOCAL ACCOUNT · THIS BROWSER ONLY</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            {mode === "login"
              ? "Sign in to pick up your tracker progress where you left off."
              : "Set an email and password so your progress here stays separate from anyone else on this machine."}
          </p>
        </header>

        <div className="flex gap-1 p-1 rounded-lg bg-surface2 border border-border mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 px-3 py-2 rounded-md font-mono text-[11px] tracking-wide transition-colors ${
              mode === "login" ? "bg-surface3 text-text ring-1 ring-accent/40" : "text-muted hover:text-text"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 px-3 py-2 rounded-md font-mono text-[11px] tracking-wide transition-colors ${
              mode === "register" ? "bg-surface3 text-text ring-1 ring-accent/40" : "text-muted hover:text-text"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface2 px-3.5 py-2.5 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
              className="w-full rounded-lg border border-border bg-surface2 px-3.5 py-2.5 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
            />
          </Field>

          {mode === "register" && (
            <Field label="Confirm password">
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                className="w-full rounded-lg border border-border bg-surface2 px-3.5 py-2.5 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
              />
            </Field>
          )}

          {error && (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-accent text-bg font-medium text-sm hover:bg-accent2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted/70 mt-6 leading-relaxed">
          No server — your password is hashed and stored, along with your progress, only in this browser. Clearing
          browser data or switching machines means starting over, so export a backup from the dashboard if you rely
          on this.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] text-muted tracking-wide mb-1.5">{label.toUpperCase()}</span>
      {children}
    </label>
  );
}
