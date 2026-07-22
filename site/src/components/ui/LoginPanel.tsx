"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type LoginMode = "login" | "signup";

const FIELD_CLASS =
  "min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition placeholder:text-[var(--muted)]/55 hover:border-[var(--river-deep)]/35 focus:border-[var(--river-deep)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]";

const LABEL_CLASS =
  "grid gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function LoginPanel() {
  const [mode, setMode] = useState<LoginMode>("login");
  const panelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const countries = useMemo(() => countryOptions(locale), [locale]);
  const nextPath = safeNextPath(searchParams.get("next"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const labels = {
    login: {
      tab: "Log in",
      title: "Welcome back",
      body: "Your saved routes, bookings, and travel notes are ready.",
      cta: "Log in",
      alt: "New to LingTour?",
      altLink: "Create account",
    },
    signup: {
      tab: "Sign up",
      title: "Begin your journey",
      body: "Keep every Guangdong route and booking in one place.",
      cta: "Create account",
      alt: "Already have an account?",
      altLink: "Log in",
    },
  } as const;

  const copy = labels[mode];

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
        timeline
          .fromTo("[data-auth-media]", { autoAlpha: 0, scale: 1.035 }, { autoAlpha: 1, scale: 1, duration: 0.9 })
          .fromTo("[data-auth-form]", { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.72 }, "-=0.58");
      });
      return () => media.revert();
    },
    { scope: panelRef },
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-auth-mode-content]",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.42, ease: motionEase.enter, stagger: 0.035 },
        );
      });
      return () => media.revert();
    },
    { scope: formPanelRef, dependencies: [mode], revertOnUpdate: true },
  );

  function finishAuthentication(user: AuthResponse["user"]) {
    persistAuthUser(user);
    router.replace(nextPath);
    router.refresh();
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
        const data = await apiPost<AuthResponse>("/auth/login", { email, password });
        localStorage.setItem("lingtour-token", data.access_token);
        finishAuthentication(data.user);
      } else {
        const name = String(formData.get("name") || "Maya Chen");
        const country = String(formData.get("country") || "SG");
        const travelStyle = String(formData.get("travelStyle") || "Culture routes and food walks");
        const data = await apiPost<AuthResponse>("/auth/register", { name, email, password });
        localStorage.setItem("lingtour-token", data.access_token);
        persistAuthUser(data.user, { country, travelStyle });
        await updateCurrentUserProfile({ country, travelStyle });
        router.replace(nextPath);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
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
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setError(null);
  }

  return (
    <div
      ref={panelRef}
      className="grid overflow-hidden rounded-[var(--radius-xl)] border border-white/14 bg-[var(--paper)] shadow-[0_34px_100px_rgba(0,0,0,0.3)] lg:min-h-[38rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(25rem,0.76fr)]"
    >
      <aside
        data-auth-media
        className="relative min-h-32 overflow-hidden border-b border-white/10 sm:min-h-44 lg:min-h-[43rem] lg:border-b-0 lg:border-r"
      >
        <Image
          src="/editorial/guangzhou-arcade-street.jpg"
          alt="A historic arcade street in Guangzhou"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,34,0.82),rgba(10,28,34,0.12)_68%),linear-gradient(180deg,rgba(10,28,34,0.08),rgba(10,28,34,0.72))]" />
        <div className="absolute inset-0 bg-grain opacity-[0.13]" />
        <div className="relative flex h-full min-h-32 flex-col justify-end p-4 text-white sm:min-h-44 sm:p-7 lg:min-h-[43rem] lg:p-12">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
            LingTour traveler account
          </p>
          <h2 className="mt-2 max-w-[10ch] font-[family:var(--font-display)] text-[clamp(1.85rem,8vw,4.8rem)] leading-[0.94] tracking-[-0.045em] lg:mt-5">
            Guangdong, kept close.
          </h2>
          <p className="mt-3 hidden max-w-md text-sm leading-6 text-white/72 sm:block lg:mt-5 lg:text-base lg:leading-7">
            Return to the routes, objects, and local stories you chose to remember.
          </p>
        </div>
      </aside>

      <div
        ref={formPanelRef}
        data-auth-form
        className="relative flex flex-col justify-center bg-[rgba(244,242,238,0.98)] px-5 py-6 sm:px-9 sm:py-8 lg:px-11 lg:py-10"
      >
        <div className="mb-7 grid grid-cols-2 rounded-full border border-[var(--line)] bg-white/56 p-1">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`min-h-11 rounded-full px-5 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.18em] transition active:scale-[0.98] ${
                mode === item
                  ? "bg-[var(--river-deep)] text-white"
                  : "text-[var(--muted)] hover:bg-white/76 hover:text-[var(--river-deep)]"
              }`}
              aria-pressed={mode === item}
              onClick={() => switchMode(item)}
            >
              {labels[item].tab}
            </button>
          ))}
        </div>

        <div data-auth-mode-content>
          <h1 className="font-[family:var(--font-display)] text-[clamp(2.7rem,7vw,4rem)] leading-[0.94] tracking-[-0.045em] text-[var(--river-deep)]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">{copy.body}</p>
        </div>

        {error ? (
          <div
            className="mt-5 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/6 px-4 py-3 text-xs font-semibold leading-5 text-[var(--cinnabar)]"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form
          ref={formRef}
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSignIn();
          }}
        >
          {mode === "signup" ? (
            <div data-auth-mode-content className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className={LABEL_CLASS}>
                Full name
                <input name="name" autoComplete="name" className={FIELD_CLASS} placeholder="Maya Chen" required />
              </label>
              <label className={LABEL_CLASS}>
                Country
                <select name="country" defaultValue="SG" className={`${FIELD_CLASS} appearance-none`}>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <label data-auth-mode-content className={LABEL_CLASS}>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className={FIELD_CLASS}
              placeholder="you@example.com"
              required
            />
          </label>

          <label data-auth-mode-content className={LABEL_CLASS}>
            Password
            <span className="relative block">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                className={`${FIELD_CLASS} pr-20`}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1 top-1/2 min-h-10 -translate-y-1/2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:text-[var(--cinnabar)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {mode === "signup" ? (
            <label data-auth-mode-content className={LABEL_CLASS}>
              Travel style
              <select name="travelStyle" className={`${FIELD_CLASS} appearance-none`}>
                <option>Culture routes and food walks</option>
                <option>Craft workshops and museums</option>
                <option>Slow city walks and local life</option>
                <option>Interpreting support for groups</option>
              </select>
            </label>
          ) : null}

          <button
            data-auth-mode-content
            type="submit"
            disabled={loading}
            className="mt-2 min-h-12 w-full rounded-full bg-[var(--river-deep)] px-7 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--cinnabar)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? "Processing..." : copy.cta}
          </button>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <button
              data-auth-mode-content
              type="button"
              onClick={() => void handleGoogleLogin()}
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-white/72 px-6 py-3 text-xs font-semibold text-[var(--river-deep)] transition hover:border-[var(--river-deep)]/35 hover:bg-white active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          ) : null}

          <p data-auth-mode-content className="pt-1 text-center text-xs text-[var(--muted)]">
            {copy.alt}{" "}
            <button
              type="button"
              className="font-semibold text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/35 underline-offset-4 transition hover:text-[var(--cinnabar-deep)]"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            >
              {copy.altLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
