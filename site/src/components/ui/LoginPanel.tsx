"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, ApiRequestError } from "@/lib/api-client";

interface AuthResponse {
  access_token: string;
  expires_in: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string | null;
  };
}

export function LoginPanel() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = {
    signin: {
      tab: "Sign in",
      title: "Welcome back",
      cta: "Sign in",
      alt: "New to LingTour?",
      altLink: "Create account",
    },
    register: {
      tab: "Register",
      title: "Create account",
      cta: "Create account",
      alt: "Already have an account?",
      altLink: "Sign in",
    },
  };

  const t = labels[mode];

  function storeUserAndRedirect(user: AuthResponse["user"]) {
    localStorage.setItem(
      "lingtour-user",
      JSON.stringify({
        name: user.name || "Guest",
        email: user.email,
      }),
    );
    window.dispatchEvent(new Event("lingtour-auth"));
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
      if (mode === "signin") {
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

        localStorage.setItem(
          "lingtour-user",
          JSON.stringify({ name, email, country, travelStyle }),
        );
        window.dispatchEvent(new Event("lingtour-auth"));
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

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white shadow-[0_24px_70px_rgba(17,25,35,0.08)]">
      <div className="grid grid-cols-2 border-b border-[var(--line)] bg-[var(--paper)]">
        {(["signin", "register"] as const).map((item) => (
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
          {mode === "register" ? (
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

          {mode === "register" ? (
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

          <p className="text-center text-sm text-[var(--muted)]">
            {t.alt}{" "}
            <button
              type="button"
              className="font-semibold text-[var(--cinnabar)] hover:text-[var(--cinnabar-deep)]"
              onClick={() => {
                setMode(mode === "signin" ? "register" : "signin");
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
