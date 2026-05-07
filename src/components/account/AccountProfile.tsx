"use client";

import { useState } from "react";

type LocalUser = {
  name: string;
  email: string;
  country: string;
  travelStyle: string;
};

const fallbackUser: LocalUser = {
  name: "Maya Chen",
  email: "guest@lingtour.cn",
  country: "Singapore",
  travelStyle: "Culture routes and food walks",
};

export function AccountProfile() {
  const [user] = useState<LocalUser>(() => {
    if (typeof window === "undefined") {
      return fallbackUser;
    }

    const storedUser = window.localStorage.getItem("lingtour-user");
    if (storedUser) {
      return JSON.parse(storedUser) as LocalUser;
    }

    return fallbackUser;
  });

  return (
    <div className="relative overflow-hidden bg-[var(--night)] text-white shadow-[0_30px_90px_rgba(17,25,35,0.2)]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-28"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1600&q=82)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.98),rgba(17,25,35,0.78),rgba(17,25,35,0.52))]" />
      <div className="relative z-10 grid gap-8 p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <section>
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-4xl shadow-[0_20px_60px_rgba(182,66,53,0.35)]">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <p className="mt-8 text-label text-white/46">Member profile</p>
          <h2 className="mt-3 font-[family:var(--font-display)] text-5xl leading-tight">{user.name}</h2>
          <p className="mt-3 text-sm text-white/62">{user.email}</p>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/74">
            Preferred travel style: {user.travelStyle}. This profile keeps route planning, store
            objects, and service drafts in one place.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {[
            ["Country / region", user.country],
            ["Language", "English"],
            ["Saved routes", "Synced from favorites"],
            ["Store orders", "2 recent orders"],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/12 bg-white/8 p-5 backdrop-blur">
              <p className="text-label text-white/44">{label}</p>
              <p className="mt-5 font-[family:var(--font-display)] text-2xl leading-tight">{value}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
