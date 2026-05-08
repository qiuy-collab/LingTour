"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginPanel() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSignIn() {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);

    const email = String(formData.get("email") || "guest@lingtour.cn");
    const name = String(formData.get("name") || "Maya Chen");
    const country = String(formData.get("country") || "Singapore");
    const travelStyle = String(formData.get("travelStyle") || "Culture routes and food walks");

    try {
      window.localStorage.setItem(
        "lingtour-user",
        JSON.stringify({
          name,
          email,
          country,
          travelStyle,
        }),
      );
      window.dispatchEvent(new Event("lingtour-auth"));
      router.push("/account");
    } catch {
      router.push("/account");
    }
  }

  return (
    <form
      ref={formRef}
      id="lingtour-login-form"
      className="overflow-hidden border border-white/12 bg-[var(--night)] text-white shadow-[0_30px_90px_rgba(17,25,35,0.22)]"
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSignIn();
        }
      }}
    >
      <div className="grid grid-cols-2 border-b border-white/12 bg-white/4">
        {(["signin", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            data-auth-tab={item}
            className={`px-5 py-4 text-sm font-semibold transition ${
              mode === item ? "bg-[var(--paper)] text-[var(--river-deep)]" : "text-white/62 hover:text-white"
            }`}
            onClick={() => setMode(item)}
          >
            {item === "signin" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 p-5 sm:p-6">
          <div
            data-register-fields
            className={`${mode === "register" ? "grid" : "hidden"} gap-4 md:grid-cols-2`}
          >
            <label className="grid gap-2 text-sm text-white/82">
              Name
              <input
                name="name"
                defaultValue="Maya Chen"
                className="border border-white/14 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-[var(--cinnabar)]"
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/82">
              Country / region
              <input
                name="country"
                defaultValue="Singapore"
                className="border border-white/14 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-[var(--cinnabar)]"
                placeholder="Country / region"
              />
            </label>
          </div>
        <label className="grid gap-2 text-sm text-white/82">
          Email
          <input
            name="email"
            defaultValue="guest@lingtour.cn"
            className="border border-white/14 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-[var(--cinnabar)]"
            placeholder="you@example.com"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/82">
          Password
          <input
            type="password"
            className="border border-white/14 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-[var(--cinnabar)]"
            placeholder="Demo password"
          />
        </label>
        <label className="grid gap-2 text-sm text-white/82">
          Travel interest
          <select
            name="travelStyle"
            defaultValue="Culture routes and food walks"
            className="border border-white/14 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--cinnabar)] [&>option]:bg-[var(--night)]"
          >
            <option>Culture routes and food walks</option>
            <option>Craft workshops and museums</option>
            <option>Slow city walks and local life</option>
            <option>Interpreting support for groups</option>
          </select>
        </label>
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <label className="flex items-center gap-2 text-white/62">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--cinnabar)]" />
            Keep me signed in
          </label>
          <button type="button" className="text-white/72 hover:text-white">
            Forgot password
          </button>
        </div>
        <button type="button" className="bg-[var(--cinnabar)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--cinnabar-deep)]" onClick={handleSignIn}>
          {mode === "signin" ? "Sign in and open account" : "Create account and continue"}
        </button>
        <p className="text-xs leading-6 text-white/48">
          Demo mode: this stores a sample profile locally. The account pass opens from the header
          avatar; real auth can connect later.
        </p>
      </div>
    </form>
  );
}
