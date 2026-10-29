import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import videoAsset from "@/assets/navoscope-loop.mp4.asset.json";
import {
  accountsKey,
  hashPassword,
  initialsFromName,
  newSalt,
  normalizeIdentity,
  readAccounts,
  sessionKey,
  validIdentity,
  type Account,
} from "@/lib/navoscope-accounts";

type Mode = "login" | "signup" | "username" | null;

export function pageFromPath(path: string): number | null {
  if (path === "/default") return 1;
  const m = /^\/page-([1-4])$/.exec(path);
  return m ? Number(m[1]) : null;
}
function modeFromPath(path: string): Mode {
  return path === "/login" ? "login" : path === "/create-account" ? "signup" : path === "/username" ? "username" : null;
}
const modePath = { login: "/login", signup: "/create-account", username: "/username" } as const;

const pages = [1, 2, 3];

/** The numbered links shown in the top nav: all of them on the homepage, otherwise the other pages. */
export function navEntries(activePage: number | null): number[] {
  return activePage === null ? pages : pages.filter((p) => p !== activePage);
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

type Status = { message: string; error: boolean } | null;

function StatusLine({ status }: { status: Status }) {
  return (
    <p
      className={`status${status?.error ? " error" : ""}`}
      id="form-status"
      role={status?.error ? "alert" : "status"}
      aria-live="polite"
      hidden={!status}
    >
      {status?.message}
    </p>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete = "off",
  password = false,
  invalid,
  inputRef,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  password?: boolean;
  invalid?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  defaultValue?: string | undefined;
}) {
  const [visible, setVisible] = useState(false);
  const isName = id === "user-name";
  const revealLabel = id === "confirm-password" ? "confirm password" : "password";
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={password ? "input-wrap" : ""}>
        <input
          ref={inputRef}
          id={id}
          name={isName ? "navoscope-new-display-name" : id}
          type={password ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCorrect={isName ? "off" : undefined}
          spellCheck={isName ? false : undefined}
          inputMode={id === "identity" ? "text" : undefined}
          maxLength={isName ? 80 : undefined}
          required
          minLength={password ? 8 : undefined}
          aria-invalid={invalid ? "true" : undefined}
          defaultValue={defaultValue}
        />
        {password && (
          <button
            type="button"
            className="reveal"
            aria-label={`${visible ? "Hide" : "Show"} ${revealLabel}`}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            <EyeIcon />
          </button>
        )}
      </div>
      {id === "new-password" && <p className="password-hint">Use at least 8 characters.</p>}
    </div>
  );
}

function useFormHelpers() {
  const [status, setStatus] = useState<Status>(null);
  const [invalidId, setInvalidId] = useState<string | null>(null);
  const invalid = (input: HTMLInputElement, message: string) => {
    setInvalidId(input.id);
    input.focus();
    setStatus({ message, error: true });
  };
  const firstEmpty = (form: HTMLFormElement) =>
    [...form.querySelectorAll<HTMLInputElement>("input[required]")].find((i) => !i.value.trim());
  return { status, setStatus, invalidId, setInvalidId, invalid, firstEmpty };
}

export function NavoscopeApp() {
  const router = useRouter();
  const path = useLocation({ select: (l) => l.pathname });
  const mode = modeFromPath(path);

  const lastNonModePath = useRef("/");
  if (!mode) lastNonModePath.current = path;
  const activePage = mode ? pageFromPath(lastNonModePath.current) : pageFromPath(path);
  const open = activePage !== null;

  const pendingSignup = useRef<{ identity: string; password: string } | null>(null);
  const loginFlash = useRef<{ identity: string; message: string } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const [account, setAccount] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [instant, setInstant] = useState(true);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const go = (to: string, replace = false) => router.navigate({ to, replace });

  // Load the browser-local session after hydration.
  const refreshAccount = () => {
    try {
      setAccount(readAccounts()[localStorage.getItem(sessionKey) ?? ""] ?? null);
    } catch {
      setAccount(null);
    }
  };
  useEffect(() => {
    refreshAccount();
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, []);

  // Video playback, respecting reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (reduced.matches) {
        video.pause();
        return;
      }
      if (document.visibilityState === "visible" && video.paused) video.play().catch(() => {});
    };
    play();
    video.addEventListener("canplay", play);
    reduced.addEventListener?.("change", play);
    document.addEventListener("visibilitychange", play);
    document.addEventListener("pointerdown", play, { once: true });
    return () => {
      video.removeEventListener("canplay", play);
      reduced.removeEventListener?.("change", play);
      document.removeEventListener("visibilitychange", play);
      document.removeEventListener("pointerdown", play);
    };
  }, []);

  // Dialog open/close with the route.
  useLayoutEffect(() => {
    if (mode === null || mode === "login") pendingSignup.current = null;
    if (mode === "username" && !pendingSignup.current) {
      go("/create-account", true);
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mode) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) {
        dialog.close();
        returnFocus.current?.focus();
      }
      document.body.style.overflow = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Close account menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".account-menu")) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        avatarRef.current?.focus();
      }
    };
    document.addEventListener("click", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeDialog = () => go(lastNonModePath.current);
  const goMode = (m: Exclude<Mode, null>) => go(modePath[m]);

  const logout = () => {
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* ignore */
    }
    window.location.replace("/");
  };

  const entries = navEntries(activePage);

  let dialogBody: ReactNode = null;
  if (mode === "login")
    dialogBody = (
      <LoginForm
        key="login"
        flash={loginFlash}
        onClose={closeDialog}
        onSignup={() => goMode("signup")}
        onLoggedIn={() => {
          refreshAccount();
          returnFocus.current = null;
          closeDialog();
        }}
      />
    );
  else if (mode === "signup")
    dialogBody = (
      <SignupForm
        key="signup"
        onClose={closeDialog}
        onLogin={() => goMode("login")}
        onContinue={(identity, password) => {
          pendingSignup.current = { identity, password };
          goMode("username");
        }}
      />
    );
  else if (mode === "username" && pendingSignup.current)
    dialogBody = (
      <UsernameForm
        key="username"
        pending={pendingSignup}
        onClose={closeDialog}
        onBackToSignup={() => goMode("signup")}
        onCreated={(identity) => {
          loginFlash.current = { identity, message: "Account created. Log in with your password." };
          goMode("login");
        }}
      />
    );

  return (
    <>
      <div id="landing" className={open ? "is-leaving" : undefined}>
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={videoAsset.url} type="video/mp4" />
        </video>
        <header className="site-header">
          <nav className="site-nav" aria-label="Primary navigation">
            {activePage !== null && (
              <Link className="nav-pill nav-home" to="/">
                Main Page
              </Link>
            )}
            {entries.map((p) => (
              <Link key={p} className="nav-pill" to={`/page-${p}` as "/page-1"} aria-label={`Page ${p}`}>
                {p}
              </Link>
            ))}
          </nav>
          <nav className="account-nav" aria-label="Account">
            {account ? (
              <div className="account-menu">
                <button
                  ref={avatarRef}
                  className="account-avatar"
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="account-dropdown"
                  aria-label={`Account menu for ${account.userName}`}
                  title={account.userName}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  {initialsFromName(account.userName)}
                </button>
                <div className="account-dropdown" id="account-dropdown" hidden={!menuOpen}>
                  <button type="button" onClick={logout}>
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={(e) => {
                  if (!dialogRef.current?.open) returnFocus.current = e.currentTarget;
                }}
              >
                Log in / Create account
              </Link>
            )}
          </nav>
        </header>
        <main className="hero" inert={open}>
          <div className="hero-inner">
            <h1>Navoscope</h1>
            <p className="tagline">
              See clearly. <em>Move forward.</em>
            </p>
            <p className="category">AI-assisted market intelligence.</p>
          </div>
        </main>
      </div>
      <main
        className={`page-transition${open ? " is-active" : ""}${instant ? " is-instant" : ""}`}
        id="page-transition"
        aria-label={open ? `Page ${activePage} placeholder` : "Function page placeholder"}
        aria-hidden={!open}
      />
      <dialog
        ref={dialogRef}
        className={`auth-dialog${mode && mode !== "login" ? " signup-dialog" : ""}`}
        id="auth"
        aria-labelledby="dialog-title"
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        onClick={(e) => {
          const dialog = e.currentTarget;
          if (e.target !== dialog) return;
          const box = dialog.getBoundingClientRect();
          if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)
            closeDialog();
        }}
      >
        <div id="dialog-content">{dialogBody}</div>
      </dialog>
    </>
  );
}

function CloseButton({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <button className="close" type="button" aria-label={label} onClick={onClose}>
      <CloseIcon />
    </button>
  );
}

function LoginForm({
  flash,
  onClose,
  onSignup,
  onLoggedIn,
}: {
  flash: React.MutableRefObject<{ identity: string; message: string } | null>;
  onClose: () => void;
  onSignup: () => void;
  onLoggedIn: () => void;
}) {
  const h = useFormHelpers();
  const [busy, setBusy] = useState(false);
  const [initial] = useState(() => {
    const f = flash.current;
    flash.current = null;
    return f;
  });
  const identityRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initial) {
      passwordRef.current?.focus();
      h.setStatus({ message: initial.message, error: false });
    } else identityRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    h.setInvalidId(null);
    const empty = h.firstEmpty(e.currentTarget);
    if (empty) return h.invalid(empty, "Please complete all fields.");
    const identity = identityRef.current!;
    const password = passwordRef.current!;
    if (!validIdentity(identity.value.trim()))
      return h.invalid(identity, "Please enter a valid email address or phone number.");
    const key = normalizeIdentity(identity.value);
    const account = readAccounts()[key];
    if (!account || typeof account.salt !== "string" || typeof account.passwordHash !== "string")
      return h.setStatus({ message: "Email or phone number and password do not match.", error: true });
    setBusy(true);
    try {
      const actual = await hashPassword(password.value, account.salt);
      if (actual !== account.passwordHash)
        return h.setStatus({ message: "Email or phone number and password do not match.", error: true });
      localStorage.setItem(sessionKey, key);
      onLoggedIn();
    } catch {
      h.setStatus({ message: "Could not log in in this browser. Please try again.", error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-content">
      <CloseButton label="Close login" onClose={onClose} />
      <h2 id="dialog-title">Welcome</h2>
      <p className="auth-subtitle">Log in to your market intelligence workspace.</p>
      <form id="login-form" noValidate onSubmit={submit}>
        <Field
          id="identity"
          label="Email or phone number"
          placeholder="Enter your email or phone number"
          autoComplete="username"
          invalid={h.invalidId === "identity"}
          inputRef={identityRef}
          defaultValue={initial?.identity}
        />
        <Field
          id="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          password
          invalid={h.invalidId === "password"}
          inputRef={passwordRef}
        />
        <div className="forgot-row">
          <a
            className="text-link"
            href="#forgot-password"
            id="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              h.setStatus({ message: "Password reset is not connected in this interface preview.", error: false });
            }}
          >
            Forgot password?
          </a>
        </div>
        <button className="submit" type="submit" disabled={busy}>
          Log in
        </button>
        <StatusLine status={h.status} />
      </form>
      <p className="switch">
        New to the platform?
        <Link
          className="text-link"
          to="/create-account"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onSignup();
          }}
        >
          Create an account
        </Link>
      </p>
      <p className="card-note">
        Your workspace, evidence and analysis in one place.
        <br />
        This demo stores test accounts only in this browser.
      </p>
    </div>
  );
}

function SignupForm({
  onClose,
  onLogin,
  onContinue,
}: {
  onClose: () => void;
  onLogin: () => void;
  onContinue: (identity: string, password: string) => void;
}) {
  const h = useFormHelpers();
  const identityRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  useEffect(() => identityRef.current?.focus({ preventScroll: true }), []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    h.setInvalidId(null);
    const empty = h.firstEmpty(e.currentTarget);
    if (empty) return h.invalid(empty, "Please complete all fields.");
    const identity = identityRef.current!;
    const password = passwordRef.current!;
    const confirm = confirmRef.current!;
    if (!validIdentity(identity.value.trim()))
      return h.invalid(identity, "Please enter a valid email address or phone number.");
    if (password.value.length < 8) return h.invalid(password, "Use at least 8 characters for your password.");
    if (password.value !== confirm.value) return h.invalid(confirm, "Your passwords do not match.");
    if (readAccounts()[normalizeIdentity(identity.value)])
      return h.invalid(identity, "An account already exists for this email or phone number. Please log in instead.");
    onContinue(identity.value.trim(), password.value);
  };

  return (
    <div className="auth-content">
      <CloseButton label="Close create account" onClose={onClose} />
      <h2 id="dialog-title">Create account</h2>
      <p className="auth-subtitle">Start your market intelligence workspace.</p>
      <form id="signup-form" noValidate onSubmit={submit}>
        <Field
          id="identity"
          label="Email or phone number"
          placeholder="Enter your email or phone number"
          autoComplete="username"
          invalid={h.invalidId === "identity"}
          inputRef={identityRef}
        />
        <Field
          id="new-password"
          label="Password"
          placeholder="Create a password"
          type="password"
          autoComplete="new-password"
          password
          invalid={h.invalidId === "new-password"}
          inputRef={passwordRef}
        />
        <Field
          id="confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          type="password"
          autoComplete="new-password"
          password
          invalid={h.invalidId === "confirm-password"}
          inputRef={confirmRef}
        />
        <button className="submit" type="submit">
          Continue
        </button>
        <StatusLine status={h.status} />
      </form>
      <p className="switch">
        Already have an account?
        <Link
          className="text-link"
          to="/login"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onLogin();
          }}
        >
          Log in
        </Link>
      </p>
      <p className="card-note">
        Your workspace, evidence and analysis in one place.
        <br />
        Use a test password for this browser-only demo.
      </p>
    </div>
  );
}

function UsernameForm({
  pending,
  onClose,
  onBackToSignup,
  onCreated,
}: {
  pending: React.MutableRefObject<{ identity: string; password: string } | null>;
  onClose: () => void;
  onBackToSignup: () => void;
  onCreated: (identity: string) => void;
}) {
  const h = useFormHelpers();
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => nameRef.current?.focus({ preventScroll: true }), []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    h.setInvalidId(null);
    const input = nameRef.current!;
    if (!input.value.trim()) return h.invalid(input, "Please complete all fields.");
    const userName = input.value.trim().replace(/\s+/gu, " ");
    const p = pending.current;
    if (!p) return onBackToSignup();
    const key = normalizeIdentity(p.identity);
    const accounts = readAccounts();
    if (accounts[key])
      return h.setStatus({
        message: "An account already exists for this email or phone number. Please log in instead.",
        error: true,
      });
    setBusy(true);
    try {
      const salt = newSalt();
      const passwordHash = await hashPassword(p.password, salt);
      accounts[key] = { identity: p.identity, userName, salt, passwordHash };
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      onCreated(p.identity);
    } catch {
      h.setStatus({ message: "Could not save this account in the browser. Please try again.", error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-content">
      <CloseButton label="Close user name step" onClose={onClose} />
      <h2 id="dialog-title">Your name</h2>
      <p className="auth-subtitle">Enter the name you want to use for your account.</p>
      <form id="username-form" autoComplete="off" noValidate onSubmit={submit}>
        <Field
          id="user-name"
          label="User name"
          placeholder="Enter your user name"
          invalid={h.invalidId === "user-name"}
          inputRef={nameRef}
        />
        <button className="submit" type="submit" disabled={busy}>
          Create account
        </button>
        <StatusLine status={h.status} />
      </form>
      <p className="card-note">Your initials will appear in the top-right corner after you log in.</p>
    </div>
  );
}
