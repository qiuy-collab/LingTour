"use client";

import Link from "next/link";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
};

type Props = {
  actions: Action[];
};

export function MobileStickyActions({ actions }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[rgba(248,244,236,0.92)] backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className={`flex-1 px-5 py-3 text-center text-sm font-medium transition ${
                action.variant === "primary"
                  ? "bg-[var(--cinnabar)] text-white hover:bg-[var(--cinnabar-deep)]"
                  : "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--cinnabar)]"
              }`}
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`flex-1 px-5 py-3 text-center text-sm font-medium transition ${
                action.variant === "primary"
                  ? "bg-[var(--cinnabar)] text-white hover:bg-[var(--cinnabar-deep)]"
                  : "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--cinnabar)]"
              }`}
            >
              {action.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
