type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={["space-y-3", alignment, className].filter(Boolean).join(" ")}>
      <p className="text-label text-[var(--muted)]">{eyebrow}</p>
      <h2 className="font-[family:var(--font-display)] text-3xl text-[var(--deep-blue)] md:text-4xl">
        {title}
      </h2>
      {description ? <p className="max-w-3xl text-base leading-8 text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
