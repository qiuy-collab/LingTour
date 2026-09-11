"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { countryOptions } from "@/lib/country-list";
import { hydrateFavoritesFromServer } from "@/lib/favorites";
import { getGoogleIdentityApi, requestGoogleCredential } from "@/lib/google-identity";
import {
  registerWithPassword,
  signInWithGoogle,
  signInWithPassword,
  updateCurrentUserProfile,
} from "@/lib/auth-client";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profile?tab=notes";
}

const fieldClass = "min-h-12 w-full border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--river-deep)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--river-deep)] lg:text-sm";
const labelClass = "grid gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]";

type Mode = "login" | "signup";

export function LoginPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const countries = useMemo(() => countryOptions(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const nextPath = safeNextPath(params.get("next"));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError(null);
    try {
      if (mode === "login") {
        await signInWithPassword(email, password);
      } else {
        const name = String(data.get("name") || "").trim();
        const country = String(data.get("country") || "SG");
        const travelStyle = String(data.get("travelStyle") || "Culture routes and food walks");
        await registerWithPassword({ name, email, password });
        await updateCurrentUserProfile({ country, travelStyle });
      }
      void hydrateFavoritesFromServer();
      router.replace(nextPath); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "An unexpected error occurred."); }
    finally { setLoading(false); }
  }

  async function googleLogin() {
    setLoading(true); setError(null);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error("Google sign-in is currently unavailable. Please use email sign-in.");
      if (!getGoogleIdentityApi()) throw new Error("Google Sign-In script not loaded.");
      await signInWithGoogle(await requestGoogleCredential(clientId));
      void hydrateFavoritesFromServer(); router.replace(nextPath); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "An unexpected error occurred."); }
    finally { setLoading(false); }
  }

  const isLogin = mode === "login";

  return (
    <main className="grid min-h-[100dvh] bg-[var(--paper-deep)] text-[var(--river-deep)] lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)]">
      <section className="relative isolate hidden min-h-[100dvh] overflow-hidden border-r border-[var(--line)] bg-[var(--night)] text-white lg:block">
        <img
          src="/editorial/guangzhou-arcade-street.jpg"
          alt="Historic arcade street in Guangzhou"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.18),rgba(17,25,35,0.12)_45%,rgba(17,25,35,0.8))]" />
        <div className="relative flex min-h-[100dvh] flex-col justify-between px-[clamp(2.5rem,7vw,7rem)] py-12">
          <div className="leading-none">
            <p className="font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.25rem,4vw,4.5rem)] tracking-[-0.05em]">Culvoy</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/72">Guangdong</p>
          </div>
          <div className="w-14 border-t border-[var(--cinnabar)]" aria-hidden="true" />
        </div>
      </section>

      <section className="flex min-h-[100dvh] items-center px-6 py-14 sm:px-10 lg:px-[clamp(3rem,7vw,7rem)]">
        <div className="w-full max-w-md">
          <h1 className="font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.75rem,4vw,4.25rem)] leading-[1] tracking-[-0.04em] text-balance lg:whitespace-nowrap">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">
            {isLogin
              ? "Sign in to return to your saved routes, field notes, and bookings."
              : "Keep your routes, field notes, and bookings in one place."}
          </p>

          {error ? (
            <div className="mt-7 border-y border-[var(--cinnabar)]/45 py-3 text-sm leading-6 text-[var(--cinnabar)]" role="alert">
              {error}
            </div>
          ) : null}

          <form className="mt-9 grid gap-6" onSubmit={submit} aria-busy={loading}>
            {!isLogin ? (
              <>
                <label className={labelClass}>
                  Full name
                  <input name="name" autoComplete="name" className={fieldClass} required />
                </label>
                <label className={labelClass}>
                  Country
                  <select name="country" defaultValue="SG" className={fieldClass}>
                    {countries.map((country) => <option key={country.code} value={country.code}>{country.label}</option>)}
                  </select>
                </label>
              </>
            ) : null}

            <label className={labelClass}>
              Email address
              <input name="email" type="email" autoComplete="email" inputMode="email" className={fieldClass} required />
            </label>
            <label className={labelClass}>
              Password
              <span className="relative block">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={isLogin ? 1 : 8}
                  className={`${fieldClass} pr-16`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-0 top-1/2 min-h-11 min-w-11 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] transition-colors hover:text-[var(--cinnabar)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            {!isLogin ? (
              <label className={labelClass}>
                Travel style
                <select name="travelStyle" className={fieldClass}>
                  <option>Culture routes and food walks</option>
                  <option>Craft workshops and museums</option>
                  <option>Slow city walks and local life</option>
                </select>
              </label>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full bg-[var(--river-deep)] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-[background-color,transform] duration-300 hover:bg-[var(--cinnabar)] active:translate-y-px disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Log in" : "Create account"}
            </button>

            {isLogin && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <button
                type="button"
                onClick={() => void googleLogin()}
                disabled={loading}
                className="min-h-12 w-full border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--river-deep)] transition-colors hover:border-[var(--river-deep)] hover:bg-white/50 disabled:opacity-50"
              >
                Continue with Google
              </button>
            ) : null}

            <p className="pt-1 text-sm text-[var(--muted)]">
              {isLogin ? "New to Culvoy?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(isLogin ? "signup" : "login"); setError(null); }}
                className="min-h-11 px-1 font-semibold text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/45 underline-offset-4"
              >
                {isLogin ? "Create account" : "Log in"}
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
