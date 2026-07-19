"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import { useLocale } from "@/lib/locale-context";
import { countryOptions } from "@/lib/country-list";
import { getGoogleIdentityApi, requestGoogleCredential } from "@/lib/google-identity";
import {
  AuthResponse,
  persistAuthUser,
  signInWithGoogle,
  updateCurrentUserProfile,
} from "@/lib/auth-client";

type ActiveField = "idle" | "name" | "country" | "email" | "password" | "travelStyle";

function FieldGuideCharacter({
  isTyping,
  showPassword,
  passwordLength,
  activeField,
  pointer,
}: {
  isTyping: boolean;
  showPassword: boolean;
  passwordLength: number;
  activeField: ActiveField;
  pointer: { x: number; y: number };
}) {
  const isGuarding = passwordLength > 0 && showPassword;
  const lookX = isGuarding ? -7 : activeField !== "idle" ? 7 : pointer.x * 18;
  const lookY = isGuarding ? -3 : activeField !== "idle" ? 5 : pointer.y * 13;
  const orangeLookX = isGuarding ? -14 : lookX;
  const orangeLookY = isGuarding ? -3 : lookY;
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(
        () => {
          if (cancelled) return;
          setBlink(true);
          setTimeout(() => {
            if (cancelled) return;
            setBlink(false);
            schedule();
          }, 130);
        },
        2400 + Math.random() * 2800,
      );
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const eye = (
    key: string,
    options: { size?: string; pupil?: string; x?: number; y?: number } = {},
  ) => (
    <div
      key={key}
      className={`relative grid place-items-center overflow-hidden rounded-full bg-white transition-all duration-150 ${
        blink ? "h-1 w-8" : (options.size ?? "h-8 w-8")
      }`}
    >
      {!blink ? (
        <>
          <span
            className={`block rounded-full bg-[var(--night)] transition-transform duration-150 ${
              options.pupil ?? "h-3.5 w-3.5"
            }`}
            style={{
              transform: `translate(${options.x ?? lookX}px, ${options.y ?? lookY}px)`,
            }}
          />
        </>
      ) : null}
    </div>
  );

  const dotEye = (
    key: string,
    options: { x?: number; y?: number; size?: string } = {},
  ) => (
    <span
      key={key}
      className={`relative rounded-full bg-[var(--night)] transition-transform duration-150 ${
        options.size ?? "h-4 w-4"
      }`}
      style={{
        transform: `translate(${options.x ?? lookX}px, ${options.y ?? lookY}px)`,
      }}
    />
  );

  return (
    <div
      className="relative mx-auto h-[31rem] w-full max-w-[34rem] transition-transform duration-500"
      style={{
        transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 5}px, 0)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-x-10 bottom-3 h-10 rounded-full bg-black/10 blur-2xl" />

      <div
        className="absolute bottom-0 left-8 h-[24rem] w-36 rounded-t-[1.8rem] bg-[#17424b] shadow-[0_28px_50px_rgba(17,25,35,0.2)] transition-transform duration-500"
        style={{ transform: `skewX(${pointer.x * -8}deg) translateY(${isTyping ? -18 : 0}px)` }}
      >
        <div className="absolute left-9 top-12 flex gap-7">
          {eye("teal-left")}
          {eye("teal-right")}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-[10.5rem] h-[17rem] w-32 rounded-t-[1.4rem] bg-[var(--night)] shadow-[0_28px_50px_rgba(17,25,35,0.18)] transition-transform duration-500"
        style={{ transform: `skewX(${pointer.x * 7}deg) translateY(${isTyping ? -6 : 0}px)` }}
      >
        <div className="absolute left-7 top-10 flex gap-6">
          {eye("navy-left", {
            size: "h-7 w-7",
            pupil: "h-3 w-3",
            x: lookX * 0.8,
            y: lookY * 0.8,
          })}
          {eye("navy-right", {
            size: "h-7 w-7",
            pupil: "h-3 w-3",
            x: lookX * 0.8,
            y: lookY * 0.8,
          })}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[13rem] w-52 rounded-t-[6.5rem] bg-[#d99d6b] shadow-[0_26px_46px_rgba(17,25,35,0.18)] transition-transform duration-500"
        style={{
          transform: `skewX(${isGuarding ? 3 : pointer.x * -5}deg) translateX(${
            isGuarding ? -4 : 0
          }px) translateY(${isGuarding ? -3 : 0}px)`,
          transformOrigin: "bottom center",
        }}
      >
        <div className="absolute left-20 top-20 flex gap-9">
          {dotEye("orange-left", { x: orangeLookX, y: orangeLookY })}
          {dotEye("orange-right", { x: orangeLookX, y: orangeLookY })}
        </div>
      </div>

      <div
        className="absolute bottom-0 right-24 h-[15rem] w-36 rounded-t-[5rem] bg-[#8fa59e] shadow-[0_26px_46px_rgba(17,25,35,0.16)] transition-transform duration-500"
        style={{ transform: `skewX(${pointer.x * 6}deg) translateY(${activeField === "password" ? -16 : 0}px)` }}
      >
        <div className="absolute left-9 top-12 flex gap-6">
          {dotEye("sage-left")}
          {dotEye("sage-right")}
        </div>
        <div className="absolute left-9 top-28 h-1.5 w-16 rounded-full bg-[var(--night)]/70" />
      </div>
    </div>
  );
}

export function LoginPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { locale } = useLocale();
  const countries = useMemo(() => countryOptions(locale), [locale]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);
  const [activeField, setActiveField] = useState<ActiveField>("idle");
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const labels = {
    login: {
      tab: "Log in",
      title: "Welcome back",
      cta: "Log in",
      alt: "New here?",
      altLink: "Create account",
    },
    signup: {
      tab: "Sign up",
      title: "Create account",
      cta: "Sign up",
      alt: "Already have an account?",
      altLink: "Log in",
    },
  };

  const t = labels[mode];

  function trackPointer(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  }

  function markField(field: ActiveField) {
    setActiveField(field);
    setIsTyping(field !== "idle");
  }

  function storeUserAndRedirect(user: AuthResponse["user"]) {
    persistAuthUser(user);
    router.push("/");
  }

  async function handleSignIn() {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const data = await apiPost<AuthResponse>("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("lingtour-token", data.access_token);
        storeUserAndRedirect(data.user);
      } else {
        const name = String(formData.get("name") || "Maya Chen");
        const country = String(formData.get("country") || "SG");
        const travelStyle = String(
          formData.get("travelStyle") || "Culture routes and food walks",
        );
        const data = await apiPost<AuthResponse>("/auth/register", {
          name,
          email,
          password,
        });
        localStorage.setItem("lingtour-token", data.access_token);
        persistAuthUser(data.user, { country, travelStyle });
        await updateCurrentUserProfile({ country, travelStyle });
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin() {
    setLoading(true);
    setError(null);
    try {
      // Use Google Identity Services to get a credential token
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError("Google sign-in is currently unavailable. Please use email sign-in.");
        return;
      }

      if (!getGoogleIdentityApi()) {
        setError("Google Sign-In script not loaded.");
        return;
      }

      const credential = await requestGoogleCredential(clientId);

      await signInWithGoogle(credential);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="group/login grid overflow-hidden rounded-[var(--radius-xl)] border border-white/12 bg-[var(--paper)] shadow-[0_34px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)]"
      onMouseMove={trackPointer}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <aside className="relative hidden min-h-[42rem] overflow-hidden border-r border-black/10 bg-[linear-gradient(145deg,#173f49,#d2bd7c_52%,#efe8dc)] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 bg-grain opacity-[0.16]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.12),transparent_42%,rgba(17,25,35,0.18))]" />
        <div
          className="pointer-events-none absolute h-64 w-64 rounded-full bg-white/16 blur-3xl transition-transform duration-300"
          style={{
            transform: `translate3d(${pointer.x * 260 + 160}px, ${pointer.y * 220 + 180}px, 0)`,
          }}
        />

        <div className="relative z-10">
          <FieldGuideCharacter
            isTyping={isTyping}
            showPassword={showPassword}
            passwordLength={passwordLength}
            activeField={activeField}
            pointer={pointer}
          />
        </div>
      </aside>

      <div className="relative bg-[rgba(244,242,238,0.97)] px-6 py-7 sm:px-10 sm:py-9">
        <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-[var(--line)] opacity-40 pointer-events-none" />

        <div className="mb-5 lg:hidden">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            Traveller account
          </p>
        </div>

        <div className="mb-7 grid grid-cols-2 rounded-full border border-[var(--line)] bg-white/56 p-1">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`min-h-11 rounded-full px-5 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.18em] transition ${
                mode === item
                  ? "bg-[var(--river-deep)] text-white"
                  : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--river-deep)]"
              }`}
              onClick={() => {
                setMode(item);
                setError(null);
              }}
            >
              {labels[item].tab}
            </button>
          ))}
        </div>

        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-[var(--gold)]">
          Account access
        </p>
        <h1 className="mb-2 mt-3 font-[family:var(--font-display)] text-5xl leading-[0.94] tracking-[-0.045em] text-[var(--river-deep)]">
          {t.title}
        </h1>
        <p className="mb-6 text-sm leading-6 text-[var(--muted)]">
          Access your saved routes, bookings, and profile.
        </p>

        {error ? (
          <div className="mb-6 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/5 px-4 py-3 text-xs font-bold text-[var(--cinnabar)] uppercase tracking-wider">
            {error}
          </div>
        ) : null}

        <form
          ref={formRef}
          className="grid gap-5"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSignIn();
            }
          }}
        >
          {mode === "signup" ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Full name
                <input
                  name="name"
                  className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/64 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)] placeholder:text-[var(--muted)]/40"
                  placeholder="Maya Chen"
                  onFocus={() => markField("name")}
                  onBlur={() => markField("idle")}
                />
              </label>
              <label className="grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Country
                <select
                  name="country"
                  defaultValue="SG"
                  className="min-h-12 appearance-none rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/64 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)]"
                  onFocus={() => markField("country")}
                  onBlur={() => markField("idle")}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <label className="grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Email Address
            <input
              name="email"
              type="email"
              className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/64 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)] placeholder:text-[var(--muted)]/40"
              placeholder="you@example.com"
              onFocus={() => markField("email")}
              onBlur={() => markField("idle")}
            />
          </label>

          <label className="grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Password
            <span className="relative block">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/64 px-4 py-3 pr-12 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)] placeholder:text-[var(--muted)]/40"
                placeholder="Enter password"
                onFocus={() => markField("password")}
                onBlur={() => markField("idle")}
                onChange={(event) => setPasswordLength(event.target.value.length)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[var(--muted)] transition hover:text-[var(--cinnabar)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18" strokeLinecap="round" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                    <path d="M9.9 4.2A9.7 9.7 0 0 1 12 4c5 0 8.5 4 10 8a15.4 15.4 0 0 1-3.1 4.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.2 6.7A15.4 15.4 0 0 0 2 12c1.5 4 5 8 10 8a9.8 9.8 0 0 0 4.1-.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </span>
          </label>

          {mode === "signup" ? (
            <label className="grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              Travel style
              <select
                name="travelStyle"
                className="min-h-12 appearance-none rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/64 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)]"
                onFocus={() => markField("travelStyle")}
                onBlur={() => markField("idle")}
              >
                <option>Culture routes and food walks</option>
                <option>Craft workshops and museums</option>
                <option>Slow city walks and local life</option>
                <option>Interpreting support for groups</option>
              </select>
            </label>
          ) : null}

          <div className="mt-2 flex items-center justify-end">
            <button type="button" className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] transition hover:text-[var(--cinnabar)]">
              Forgot?
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            className={`mt-4 min-h-12 w-full rounded-full bg-[var(--river-deep)] px-7 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--cinnabar)] ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={handleSignIn}
          >
            {loading ? "Processing..." : t.cta}
          </button>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={loading}
                className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 text-[var(--muted)] transition-all hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Continue with Google"
                title="Continue with Google"
              >
                <svg className="h-5 w-5 grayscale transition-all group-hover:grayscale-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>
            </div>
          ) : null}

          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
            {t.alt}{" "}
            <button
              type="button"
              className="text-[var(--cinnabar)] hover:text-[var(--cinnabar-deep)] underline underline-offset-4"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
            >
              {t.altLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
