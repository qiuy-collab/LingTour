"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import {
  AuthResponse,
  persistAuthUser,
  signInWithGoogle,
  updateCurrentUserProfile,
} from "@/lib/auth-client";

export function LoginPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const country = String(formData.get("country") || "Singapore");
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
    <div className="relative rotate-1 scrapbook-shadow border border-[var(--line)] bg-[var(--paper)] bg-grain overflow-hidden">
      <div className="grid grid-cols-2 border-b border-[var(--line)] bg-[var(--paper-deep)]/50">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`px-5 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
              mode === item
                ? "bg-[var(--paper)] text-[var(--river-deep)]"
                : "text-[var(--muted)] hover:bg-[var(--paper)]/50 hover:text-[var(--river-deep)]"
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

      <div className="p-8 sm:p-10 relative">
        <div className="absolute top-0 right-0 w-32 h-32 border-l border-b border-[var(--line)] opacity-10 pointer-events-none" />

        <h1 className="font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] mb-8">
          {t.title}
        </h1>

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
                />
              </label>
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Country
                <input
                  name="country"
                  className="border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] placeholder:text-[var(--muted)]/40"
                  placeholder="Singapore"
                />
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
            />
          </label>

          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Password
            <input
              name="password"
              type="password"
              className="border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] placeholder:text-[var(--muted)]/40"
              placeholder="Enter password"
            />
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
