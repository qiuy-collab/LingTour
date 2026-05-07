"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

export function LoginPanel() {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  useEffect(() => {
    const stored = window.localStorage.getItem("lingtour-user");
    if (!stored) {
      window.localStorage.setItem(
        "lingtour-user",
        JSON.stringify({
          name: "Maya Chen",
          email: "guest@lingtour.cn",
          country: "Singapore",
          travelStyle: "Culture routes and food walks",
        }),
      );
      window.dispatchEvent(new Event("lingtour-auth"));
    }
  }, []);

  function signIn(formData: FormData) {
    const email = String(formData.get("email") || "guest@lingtour.cn");
    const name = String(formData.get("name") || "Maya Chen");
    const country = String(formData.get("country") || "Singapore");
    const travelStyle = String(formData.get("travelStyle") || "Culture routes and food walks");

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
    window.location.assign("/account");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn(new FormData(event.currentTarget));
  }

  return (
    <form
      id="lingtour-login-form"
      action="/account/"
      method="get"
      className="overflow-hidden border border-white/12 bg-[var(--night)] text-white shadow-[0_30px_90px_rgba(17,25,35,0.22)]"
      onSubmit={handleSubmit}
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
      <div className="grid gap-4 p-6">
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
        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-white/62">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--cinnabar)]" />
            Keep me signed in
          </label>
          <button type="button" className="text-white/72 hover:text-white">
            Forgot password
          </button>
        </div>
        <button type="submit" className="bg-[var(--cinnabar)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--cinnabar-deep)]">
          {mode === "signin" ? "Sign in and open account" : "Create account and continue"}
        </button>
        <p className="text-xs leading-6 text-white/48">
          Demo mode: this stores a sample profile locally. The account pass opens from the header
          avatar; real auth can connect later.
        </p>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const form = document.getElementById("lingtour-login-form");
              if (!form || form.dataset.nativeLoginReady === "true") return;
              form.dataset.nativeLoginReady = "true";
              form.addEventListener("submit", (event) => {
                event.preventDefault();
                const data = new FormData(form);
                const user = {
                  name: String(data.get("name") || "Maya Chen"),
                  email: String(data.get("email") || "guest@lingtour.cn"),
                  country: String(data.get("country") || "Singapore"),
                  travelStyle: String(data.get("travelStyle") || "Culture routes and food walks")
                };
                window.localStorage.setItem("lingtour-user", JSON.stringify(user));
                window.dispatchEvent(new Event("lingtour-auth"));
                window.location.assign("/account/");
              });
              const registerFields = form.querySelector("[data-register-fields]");
              form.querySelectorAll("[data-auth-tab]").forEach((button) => {
                button.addEventListener("click", () => {
                  const isRegister = button.dataset.authTab === "register";
                  registerFields?.classList.toggle("hidden", !isRegister);
                  registerFields?.classList.toggle("grid", isRegister);
                  form.querySelectorAll("[data-auth-tab]").forEach((tab) => {
                    tab.classList.toggle("bg-[var(--paper)]", tab === button);
                    tab.classList.toggle("text-[var(--river-deep)]", tab === button);
                    tab.classList.toggle("text-white/62", tab !== button);
                  });
                });
              });
            })();
          `,
        }}
      />
    </form>
  );
}
