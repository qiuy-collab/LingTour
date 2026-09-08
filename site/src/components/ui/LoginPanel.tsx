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

  return (
    <main className="grid min-h-[100dvh] bg-[var(--paper-deep)] text-[var(--river-deep)] lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
      <section className="relative flex min-h-[12rem] flex-col justify-between overflow-hidden border-b border-[var(--line)] px-6 py-7 sm:px-10 lg:min-h-[100dvh] lg:border-b-0 lg:border-r lg:px-[clamp(2.5rem,8vw,8rem)] lg:py-12">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-[var(--line)] font-mono text-xs font-bold tracking-[0.12em]">LT</span>
          <span><strong className="block text-lg tracking-[-0.02em]">LingTour</strong><small className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Guangdong</small></span>
        </div>
        <div className="relative mt-12 max-w-xl lg:mt-0">
          <div className="mb-7 h-px w-20 bg-[var(--cinnabar)]" />
          <p className="max-w-sm text-lg leading-8 text-[var(--river-deep)] sm:text-xl">Keep the places worth returning to.</p>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-[var(--line)] pt-4 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"><span>Routes</span><span>Notes</span><span>Bookings</span></div>
        </div>
      </section>
      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-[clamp(3rem,7vw,7rem)]">
        <div className="w-full max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cinnabar)]">Traveler account</p>
          <h1 className="mt-5 font-[family:var(--font-display)] text-[clamp(2.8rem,7vw,5rem)] leading-[0.98] tracking-[-0.045em]">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">{mode === "login" ? "Your saved routes and notes are ready." : "Keep your routes, bookings, and notes together."}</p>
          {error ? <div className="mt-6 border border-[var(--cinnabar)]/45 bg-[var(--cinnabar)]/8 px-4 py-3 text-sm leading-6 text-[var(--cinnabar)]" role="alert">{error}</div> : null}
          <form className="mt-8 grid gap-6" onSubmit={submit} aria-busy={loading}>
            {mode === "signup" ? <><label className={labelClass}>Full name<input name="name" autoComplete="name" className={fieldClass} required /></label><label className={labelClass}>Country<select name="country" defaultValue="SG" className={fieldClass}>{countries.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}</select></label></> : null}
            <label className={labelClass}>Email address<input name="email" type="email" autoComplete="email" inputMode="email" className={fieldClass} required /></label>
            <label className={labelClass}>Password<span className="relative block"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "signup" ? 8 : 1} className={`${fieldClass} pr-16`} required /><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-0 top-1/2 min-h-11 min-w-11 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] hover:text-[var(--cinnabar)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span></label>
            {mode === "signup" ? <label className={labelClass}>Travel style<select name="travelStyle" className={fieldClass}><option>Culture routes and food walks</option><option>Craft workshops and museums</option><option>Slow city walks and local life</option></select></label> : null}
            <button type="submit" disabled={loading} className="min-h-12 w-full bg-[var(--river-deep)] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[var(--cinnabar)] disabled:opacity-50">{loading ? "Processing..." : mode === "login" ? "Log in" : "Create account"}</button>
            {mode === "login" && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? <button type="button" onClick={()=>void googleLogin()} disabled={loading} className="min-h-12 w-full border border-[var(--line)] px-6 py-3 text-sm font-semibold hover:border-[var(--river-deep)] disabled:opacity-50">Continue with Google</button> : null}
            <p className="text-center text-sm text-[var(--muted)]">{mode === "login" ? "New to LingTour?" : "Already have an account?"}{" "}<button type="button" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setError(null)}} className="min-h-11 px-1 font-semibold text-[var(--cinnabar)] underline underline-offset-4">{mode === "login" ? "Create account" : "Log in"}</button></p>
          </form>
        </div>
      </section>
    </main>
  );
}
