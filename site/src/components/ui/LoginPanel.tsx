"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import { AuthResponse, persistAuthUser, signInWithGoogle } from "@/lib/auth-client";

export function LoginPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = {
    login: {
      tab: "Log in",
      title: "Welcome back",
      cta: "Log in",
      alt: "New to LingTour?",
      altLink: "Sign up",
    },
    signup: {
      tab: "Sign up",
      title: "Create your account",
      cta: "Sign up",
      alt: "Already have an account?",
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
      await signInWithGoogle();
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
    <div className="rounded-lg border border-[var(--line)] bg-white shadow-[0_24px_70px_rgba(17,25,35,0.08)]">
      <div className="grid grid-cols-2 border-b border-[var(--line)] bg-[var(--paper)]">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`px-5 py-4 text-sm font-semibold transition ${
              mode === item
                ? "bg-white text-[var(--river-deep)]"
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

      <div className="p-6 sm:p-8">
        <h1 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
          {t.title}
        </h1>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          ref={formRef}
          className="mt-7 grid gap-4"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSignIn();
            }
          }}
        >
          {mode === "signup" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--river-deep)]">
                Full name
                <input
                  name="name"
                  className="rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
                  placeholder="Maya Chen"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--river-deep)]">
                Country
                <input
                  name="country"
                  className="rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
                  placeholder="Singapore"
                />
              </label>
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-medium text-[var(--river-deep)]">
            Email
            <input
              name="email"
              type="email"
              className="rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--river-deep)]">
            Password
            <input
              name="password"
              type="password"
              className="rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
              placeholder="Enter your password"
            />
          </label>

          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-medium text-[var(--river-deep)]">
              Travel style
              <select
                name="travelStyle"
                className="rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)]"
              >
                <option>Culture routes and food walks</option>
                <option>Craft workshops and museums</option>
                <option>Slow city walks and local life</option>
                <option>Interpreting support for groups</option>
              </select>
            </label>
          ) : null}

          <div className="mt-1 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input type="checkbox" className="h-4 w-4 accent-[var(--cinnabar)]" />
              Stay signed in
            </label>
            <button type="button" className="text-sm text-[var(--muted)] transition hover:text-[var(--river-deep)]">
              Forgot?
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            className={`mt-3 rounded-md px-6 py-3.5 text-sm font-semibold transition ${
              loading
                ? "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
                : "bg-[var(--cinnabar)] text-white hover:bg-[var(--cinnabar-deep)]"
            }`}
            onClick={handleSignIn}
          >
            {loading ? "Processing..." : t.cta}
          </button>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--line)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Quick access
              </span>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)] transition hover:border-[var(--cinnabar)] hover:bg-white"
                aria-label="Continue with Google"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
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

          <p className="text-center text-sm text-[var(--muted)]">
            {t.alt}{" "}
            <button
              type="button"
              className="font-semibold text-[var(--cinnabar)] hover:text-[var(--cinnabar-deep)]"
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
