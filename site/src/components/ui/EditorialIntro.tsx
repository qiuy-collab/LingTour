import type { ReactNode } from "react";

type EditorialIntroProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  tone?: "light" | "dark";
  actions?: ReactNode;
  className?: string;
};

export function EditorialIntro({
  eyebrow,
  title,
  description,
  tone = "light",
  actions,
  className = "",
}: EditorialIntroProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`site-container grid gap-7 min-[620px]:grid-cols-[minmax(0,0.92fr)_minmax(15rem,0.68fr)] min-[620px]:items-center min-[620px]:gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.68fr)] lg:gap-10 ${className}`}
    >
      <div className="max-w-4xl">
        <p className={`text-label ${isDark ? "text-white/56" : "text-[var(--cinnabar)]"}`}>
          {eyebrow}
        </p>
        <h1
          className={`mt-5 max-w-[16ch] font-[family:var(--font-display)] text-[2.35rem] leading-[1.08] sm:text-4xl md:text-5xl lg:text-6xl ${
            isDark ? "text-white" : "text-[var(--river-deep)]"
          }`}
        >
          {title}
        </h1>
      </div>

      <div
        className={`max-w-2xl border-l pl-5 md:pl-8 ${
          isDark ? "border-white/18" : "border-[var(--cinnabar)]/28"
        }`}
      >
        <div
          className={`text-base leading-8 md:text-lg ${
            isDark ? "text-white/72" : "text-[var(--muted)]"
          }`}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
        {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
    </div>
  );
}
