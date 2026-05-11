"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { ApiRequestError } from "@/lib/api-client";

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
      title: "Sign in to LingTour",
      cta: "Sign in and open account",
      alt: "Don't have an account?",
      altLink: "Register here",
    },
    register: {
      tab: "Register",
      title: "Create your profile",
      cta: "Create account and continue",
      alt: "Already have an account?",
      altLink: "Sign in here",
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
        // ── Real API login ──
        const data = await apiPost<AuthResponse>("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("lingtour-token", data.access_token);
        storeUserAndRedirect(data.user);
      } else {
        // ── Register (demo mode) ──
        // The backend does not expose a register endpoint yet.
        // For now, use the demo localStorage approach.
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
    <div className="flex flex-col border border-white/12 bg-[var(--night)] shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      <div className="grid grid-cols-2 border-b border-white/8 bg-white/2">
        {(["signin", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              mode === item
                ? "bg-white/10 text-white"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
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

      <div className="p-6 sm:p-8 lg:p-10">
        <h3 className="font-[family:var(--font-display)] text-2xl text-white md:text-3xl">
          {t.title}
        </h3>

        {/* ── Error message ── */}
        {error && (
          <div className="mt-4 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          ref={formRef}
          className="mt-8 grid gap-6"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSignIn();
            }
          }}
        >
          {mode === "register" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Full Name
                <input
                  name="name"
                  className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition focus:border-[var(--gold)]"
                  placeholder="Maya Chen"
                />
              </label>
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Country
                <input
                  name="country"
                  className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition focus:border-[var(--gold)]"
                  placeholder="Singapore"
                />
              </label>
            </div>
          )}

          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Email Address
            <input
              name="email"
              type="email"
              className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition focus:border-[var(--gold)]"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Password
            <input
              name="password"
              type="password"
              className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition focus:border-[var(--gold)]"
              placeholder="••••••••"
            />
          </label>

          {mode === "register" && (
            <label className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Travel Style
              <select
                name="travelStyle"
                className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition focus:border-[var(--gold)] [&>option]:bg-[var(--night)]"
              >
                <option>Culture routes and food walks</option>
                <option>Craft workshops and museums</option>
                <option>Slow city walks and local life</option>
                <option>Interpreting support for groups</option>
              </select>
            </label>
          )}

          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white/40 transition hover:text-white/60">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--gold)]" />
              Stay signed in
            </label>
            <button type="button" className="text-xs text-white/40 transition hover:text-white/60">
              Forgot?
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            className={`mt-4 px-6 py-4 text-xs font-bold uppercase tracking-widest transition ${
              loading
                ? "cursor-not-allowed bg-white/40 text-[var(--night)]"
                : "bg-white text-[var(--night)] hover:bg-[var(--gold)] hover:text-white"
            }`}
            onClick={handleSignIn}
          >
            {loading ? "Processing..." : t.cta}
          </button>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <span className="relative bg-[var(--night)] px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Connect via
              </span>
            </div>

            <div className="flex justify-center gap-5">
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/5 transition hover:bg-white/10 hover:border-white/30"
                aria-label="Continue with Google"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/5 transition hover:bg-white/10 hover:border-white/30"
                aria-label="Continue with WhatsApp"
              >
                <svg className="h-6 w-6 fill-current text-[#25D366]" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/30">
            {t.alt}{" "}
            <button
              type="button"
              className="font-bold text-white/60 hover:text-white"
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
