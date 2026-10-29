import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import videoAsset from "@/assets/navoscope-loop.mp4.asset.json";
import { supabase } from '@/integrations/supabase/client';
import { useNavoscopeAuth } from '@/hooks/use-navoscope-auth';
import { initialsFromName, emailError, passwordError, safeDestination, authError } from '@/lib/navoscope-auth';

type Mode = "login" | "signup" | "username" | "reset" | null;

export function pageFromPath(path: string): number | null {
  if (path === "/default") return 1;
  const m = /^\/page-([1-4])$/.exec(path);
  return m ? Number(m[1]) : null;
}
function modeFromPath(path: string): Mode {
  return path === "/reset-password" ? "reset" : path === "/login" ? "login" : path === "/create-account" ? "signup" : path === "/username" ? "username" : null;
}
const modePath = { login: "/login", signup: "/create-account", username: "/username", reset: "/reset-password" } as const;

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
  const search = useLocation({ select: l => l.search }) as { next?: string };
  const destination = safeDestination(search.next);
  const { account, loading: authLoading, error: sessionError } = useNavoscopeAuth();
  const protectedPage = [1, 2, 3].includes(pageFromPath(path) ?? 0);

  const lastNonModePath = useRef("/");
  if (!mode) lastNonModePath.current = path;
  const activePage = mode || (protectedPage && (authLoading || !account)) ? null : pageFromPath(path);
  const open = activePage !== null;

  const pendingSignup = useRef<{ identity: string; password: string } | null>(null);
  const loginFlash = useRef<{ identity: string; message: string } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [instant, setInstant] = useState(true);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const go = (to: string, replace = false) => router.navigate({ to, replace });

  useEffect(() => {
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.has('error')) loginFlash.current = { identity: '', message: 'This email link has expired or is invalid. Request a new confirmation by signing up again, or use Forgot password.' };
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

  const closeDialog = () => { pendingSignup.current = null; go("/"); };
  const goMode = (m: Exclude<Mode, null>) => router.navigate({ to: modePath[m], search: { next: destination } });

  const logout = async () => {
    setLogoutError(null);
    await router.options.context.queryClient.cancelQueries();
    router.options.context.queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { setLogoutError(authError(error)); return; }
    setMenuOpen(false);
    await go('/', true);
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
          returnFocus.current = null;
          void go(destination, true);
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
          loginFlash.current = { identity, message: "Check your email to confirm ownership before logging in. If this email already has an account, log in or reset your password." };
          goMode("login");
        }}
      />
    );

  if (mode === 'reset') dialogBody = <ResetPasswordForm onClose={closeDialog} onLogin={() => goMode('login')} />;

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
            {!authLoading && account ? (
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
            ) : !authLoading ? (
              <Link
                to="/login"
                onClick={(e) => {
                  if (!dialogRef.current?.open) returnFocus.current = e.currentTarget;
                }}
              >
                Log in / Create account
              </Link>
            ) : null}
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
      {sessionError && <p className="status error" role="alert">{sessionError}</p>}
      {logoutError && <p className="status error" role="alert">{logoutError}</p>}
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
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.has('error')) {
      h.setStatus({ message: 'This confirmation link is invalid, expired or already used. Sign up again to request a new confirmation email.', error: true });
      return;
    }
    if (initial) {
      passwordRef.current?.focus();
      h.setStatus({ message: initial.message, error: initial.message.includes('expired') });
    } else identityRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    h.setInvalidId(null);
    const empty = h.firstEmpty(e.currentTarget);
    if (empty) return h.invalid(empty, "Please complete all fields.");
    if (busy) return;
    const identity = identityRef.current;
    const password = passwordRef.current;
    if (!identity || !password) return;
    const validation = emailError(identity.value);
    if (validation) return h.invalid(identity, validation);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: identity.value.trim(), password: password.value });
      if (error) return h.setStatus({ message: authError(error), error: true });
      onLoggedIn();
    } catch (error) {
      h.setStatus({ message: authError(error), error: true });
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
            aria-disabled={busy}
            onClick={async (e) => {
              e.preventDefault();
              if (busy) return;
              const input = identityRef.current;
              if (!input) return;
              const validation = emailError(input.value);
              if (validation) return h.invalid(input, validation);
              setBusy(true);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(input.value.trim(), { redirectTo: `${window.location.origin}/reset-password` });
                if (error) throw error;
                h.setStatus({ message: 'If an account exists for this email, a password reset link has been sent. Check your inbox.', error: false });
              } catch (error) { h.setStatus({ message: authError(error), error: true }); }
              finally { setBusy(false); }
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
    const identity = identityRef.current;
    const password = passwordRef.current;
    const confirm = confirmRef.current;
    if (!identity || !password || !confirm) return;
    const validation = emailError(identity.value);
    if (validation) return h.invalid(identity, validation);
    const failure = passwordError(password.value, confirm.value);
    if (failure) return h.invalid(password.value.length < 8 ? password : confirm, failure);
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
    const input = nameRef.current;
    if (!input || busy) return;
    if (!input.value.trim()) return h.invalid(input, "Please complete all fields.");
    const userName = input.value.trim().replace(/\s+/gu, " ");
    const p = pending.current;
    if (!p) return onBackToSignup();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({ email: p.identity, password: p.password, options: { data: { display_name: userName }, emailRedirectTo: `${window.location.origin}/login` } });
      if (error) throw error;
      pending.current = null;
      onCreated(p.identity);
    } catch (error) {
      h.setStatus({ message: authError(error), error: true });
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

function ResetPasswordForm({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  const h = useFormHelpers();
  const [busy, setBusy] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    let recoveryLink = params.get('type') === 'recovery' && !params.has('error');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY' && alive) { recoveryLink = true; setValid(true); setChecking(false); h.setStatus(null); }
    });
    void supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!alive) return;
      setValid(recoveryLink && !!user && !error);
      setChecking(false);
      if (!recoveryLink || !user || error) h.setStatus({ message: 'This reset link is invalid, expired or already used. Return to login and request a new reset email.', error: true });
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid || busy) return;
    const password = passwordRef.current;
    const confirm = confirmRef.current;
    if (!password || !confirm) return;
    const failure = passwordError(password.value, confirm.value);
    if (failure) return h.invalid(password.value.length < 8 ? password : confirm, failure);
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.value });
      if (error) throw error;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setValid(false);
      h.setStatus({ message: 'Password updated. Return to login to sign in with your new password.', error: false });
    } catch (error) { h.setStatus({ message: authError(error), error: true }); }
    finally { setBusy(false); }
  };
  return <div className="auth-content">
    <CloseButton label="Close password reset" onClose={onClose} />
    <h2 id="dialog-title">Reset password</h2>
    <form noValidate onSubmit={submit}>
      <Field id="new-password" label="New password" placeholder="Enter a new password" password autoComplete="new-password" inputRef={passwordRef} invalid={h.invalidId === 'new-password'} />
      <Field id="confirm-password" label="Confirm password" placeholder="Re-enter your password" password autoComplete="new-password" inputRef={confirmRef} invalid={h.invalidId === 'confirm-password'} />
      <button className="submit" disabled={busy || checking || !valid} type="submit">{checking ? 'Checking reset link…' : busy ? 'Updating…' : 'Update password'}</button>
      <StatusLine status={h.status} />
    </form>
    <p className="switch"><button type="button" className="text-link" onClick={onLogin}>Return to login</button></p>
  </div>;
}
