"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import { useLocale } from "@/lib/locale-context";
import { countryOptions } from "@/lib/country-list";
import {
  AuthResponse,
  persistAuthUser,
  signInWithGoogle,
  updateCurrentUserProfile,
} from "@/lib/auth-client";

function FieldGuideCharacter({
  isTyping,
  showPassword,
  passwordLength,
}: {
  isTyping: boolean;
  showPassword: boolean;
  passwordLength: number;
}) {
  const isGuarding = passwordLength > 0 && !showPassword;
  const eyeShift = isTyping ? "translate-x-1 translate-y-0.5" : "";
  const brimTilt = showPassword ? "rotate-2" : isGuarding ? "-rotate-3" : "-rotate-1";

  return (
    <div className="relative mx-auto h-[25rem] w-full max-w-[25rem]" aria-hidden="true">
      <div className="absolute inset-x-8 bottom-4 h-8 bg-black/10 blur-2xl" />

      <div className="absolute left-4 top-8 w-36 -rotate-6 border border-white/35 bg-white/55 px-4 py-3 shadow-[0_18px_40px_rgba(17,25,35,0.14)] backdrop-blur">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.26em] text-[var(--gold)]">
          Field permit
        </p>
        <div className="mt-3 h-1.5 w-20 bg-[var(--river-deep)]/18" />
        <div className="mt-2 h-1.5 w-14 bg-[var(--cinnabar)]/20" />
      </div>

      <div className="absolute right-5 top-12 h-24 w-20 rotate-6 border-[7px] border-white bg-[var(--paper)] shadow-[0_18px_40px_rgba(17,25,35,0.16)]">
        <div className="h-full bg-[linear-gradient(140deg,var(--river-deep),#2b6470)] p-2">
          <div className="h-full border border-white/35">
            <p className="mt-3 text-center font-[family:var(--font-display)] text-3xl italic text-white">LT</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 h-64 w-48 -translate-x-1/2">
        <div
          className={`absolute left-1/2 top-0 h-12 w-40 -translate-x-1/2 rounded-[100%] bg-[var(--gold)] shadow-[0_12px_28px_rgba(17,25,35,0.16)] transition-transform duration-500 ${brimTilt}`}
        />
        <div className="absolute left-1/2 top-5 h-16 w-28 -translate-x-1/2 rounded-t-[3rem] bg-[var(--parchment-deep)] shadow-[inset_0_-8px_0_rgba(17,25,35,0.07)]" />
        <div className="absolute left-1/2 top-[4.2rem] h-28 w-36 -translate-x-1/2 rounded-[44%_44%_36%_36%] bg-[#d9a06f] shadow-[inset_-10px_-8px_0_rgba(107,52,31,0.08)]">
          <div className="absolute left-7 top-10 h-8 w-8 rounded-full bg-white shadow-inner">
            <span className={`block h-3 w-3 rounded-full bg-[var(--river-deep)] transition-transform duration-200 ${eyeShift} translate-x-2.5 translate-y-2.5`} />
          </div>
          <div className="absolute right-7 top-10 h-8 w-8 rounded-full bg-white shadow-inner">
            <span className={`block h-3 w-3 rounded-full bg-[var(--river-deep)] transition-transform duration-200 ${eyeShift} translate-x-2.5 translate-y-2.5`} />
          </div>
          <div className={`absolute left-1/2 top-[4.7rem] h-2 w-8 -translate-x-1/2 rounded-full bg-[var(--cinnabar)]/75 transition-all duration-300 ${showPassword ? "w-10" : ""}`} />
        </div>

        <div className="absolute bottom-0 left-1/2 h-28 w-44 -translate-x-1/2 rounded-t-[4rem] bg-[var(--river-deep)] shadow-[0_24px_40px_rgba(17,25,35,0.18)]">
          <div className="absolute left-1/2 top-5 h-14 w-20 -translate-x-1/2 border border-white/20 bg-white/10">
            <p className="mt-4 text-center font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/75">
              Guide
            </p>
          </div>
        </div>

        <div
          className={`absolute bottom-16 left-0 h-10 w-24 origin-right rounded-full bg-[#d9a06f] transition-transform duration-500 ${
            isGuarding ? "translate-x-14 -translate-y-8 rotate-12" : "-rotate-12"
          }`}
        />
        <div
          className={`absolute bottom-16 right-0 h-10 w-24 origin-left rounded-full bg-[#d9a06f] transition-transform duration-500 ${
            isGuarding ? "-translate-x-14 -translate-y-8 -rotate-12" : "rotate-12"
          }`}
        />
      </div>

      <div className="absolute bottom-0 left-8 right-8 border border-[var(--line)] bg-white/65 px-5 py-4 shadow-[0_20px_45px_rgba(17,25,35,0.11)] backdrop-blur">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
          Passport desk
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--river-deep)] handwritten">
          {isGuarding
            ? "Password noted. I am politely looking away."
            : isTyping
              ? "Checking the registry while you type."
              : "Ready to reopen your Guangdong field notes."}
        </p>
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

  const labels = {
    login: {
      tab: "Field Registry",
      title: "Log in",
      cta: "Log in",
      alt: "New to the dispatch?",
      altLink: "Sign up",
    },
    signup: {
      tab: "New Recruit",
      title: "Sign up",
      cta: "Sign up",
      alt: "Already in the registry?",
      altLink: "Log in",
    },
  };

  const t = labels[mode];

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
        setError("Google login is not configured.");
        return;
      }

      const { google } = window as any;
      if (!google?.accounts?.id) {
        setError("Google Sign-In script not loaded.");
        return;
      }

      const credential = await new Promise<string>((resolve, reject) => {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string; error?: string }) => {
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error(response.error || "Google sign-in cancelled"));
            }
          },
        });
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error("Google sign-in popup was blocked or dismissed"));
          }
        });
      });

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
    <div className="grid overflow-hidden border border-[var(--line)] bg-[var(--paper)] bg-grain shadow-[0_34px_90px_rgba(17,25,35,0.16)] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)]">
      <aside className="relative hidden min-h-[42rem] overflow-hidden border-r border-black/10 bg-[linear-gradient(145deg,#214d58,#d8c48c_52%,#efe8dc)] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grain opacity-[0.16]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.12),transparent_42%,rgba(17,25,35,0.18))]" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-white/70">
              LingTour Registry
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-5xl italic leading-none text-white">
              Field Desk
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center border border-white/35 bg-white/18 font-[family:var(--font-display)] text-2xl italic shadow-[0_16px_36px_rgba(17,25,35,0.15)]">
            LT
          </div>
        </div>

        <div className="relative z-10">
          <FieldGuideCharacter
            isTyping={isTyping}
            showPassword={showPassword}
            passwordLength={passwordLength}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
          <span>Routes</span>
          <span>Culture</span>
          <span>Community</span>
        </div>
      </aside>

      <div className="relative bg-[rgba(244,242,238,0.94)] p-7 sm:p-10">
        <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-[var(--line)] opacity-40 pointer-events-none" />

        <div className="mb-8 lg:hidden">
          <p className="font-[family:var(--font-display)] text-5xl italic leading-none text-[var(--river-deep)]">
            LingTour
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] handwritten">
            Return to saved routes, bookings, and quiet plans.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 border border-[var(--line)] bg-white/50">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
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
          Passport access
        </p>
        <h1 className="mb-3 mt-3 font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)]">
          {t.title}
        </h1>
        <p className="mb-8 text-sm leading-6 text-[var(--muted)]">
          Open your traveler record, saved routes, and community notes.
        </p>

        {error ? (
          <div className="mb-6 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/5 px-4 py-3 text-xs font-bold text-[var(--cinnabar)] uppercase tracking-wider">
            {error}
          </div>
        ) : null}

        <form
          ref={formRef}
          className="grid gap-6"
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
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Full name
                <input
                  name="name"
                  className="border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] placeholder:text-[var(--muted)]/40"
                  placeholder="Maya Chen"
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
              </label>
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Country
                <select
                  name="country"
                  defaultValue="SG"
                  className="appearance-none border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
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

          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Email Address
            <input
              name="email"
              type="email"
              className="border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] placeholder:text-[var(--muted)]/40"
              placeholder="you@example.com"
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />
          </label>

          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Password
            <span className="relative block">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full border-b border-[var(--line)] bg-transparent px-1 py-3 pr-12 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] placeholder:text-[var(--muted)]/40"
                placeholder="Enter password"
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
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
            <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
              Travel style
              <select
                name="travelStyle"
                className="border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] appearance-none"
              >
                <option>Culture routes and food walks</option>
                <option>Craft workshops and museums</option>
                <option>Slow city walks and local life</option>
                <option>Interpreting support for groups</option>
              </select>
            </label>
          ) : null}

          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-[var(--cinnabar)] border-[var(--line)]" />
              Stay signed in
            </label>
            <button type="button" className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] transition hover:text-[var(--cinnabar)]">
              Forgot?
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            className={`mt-4 btn-primary w-full ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={handleSignIn}
          >
            {loading ? "Processing..." : t.cta}
          </button>

          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-[var(--line)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
                Passport login
              </span>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="group relative h-16 w-16 place-items-center flex items-center justify-center rounded-full border border-[var(--line)] bg-transparent transition-all hover:border-[var(--cinnabar)] hover:bg-white scrapbook-shadow"
                aria-label="Continue with Google"
              >
                <svg className="h-7 w-7 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24" aria-hidden="true">
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
          </div>

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
