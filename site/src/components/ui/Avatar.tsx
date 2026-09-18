"use client";

import { useMemo } from "react";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  /** Stable seed used to pick the fallback colour. Falls back to `name`. */
  seed?: string | null;
  size?: number;
  shape?: "round" | "square";
  className?: string;
  /** Optional explicit border ring class, e.g. `ring-2 ring-white`. */
  ringClassName?: string;
  alt?: string;
};

/** Pull up to two letters from the visible name. Handles CJK + Latin. */
function getInitials(name?: string | null): string {
  if (!name) return "·";
  const trimmed = name.trim();
  if (!trimmed) return "·";

  // For CJK names just take the first character.
  if (/[㐀-鿿]/.test(trimmed[0]!)) {
    return trimmed[0]!;
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Deterministic colour palette so the same user always renders the same chip. */
const PALETTE = [
  { bg: "#14343d", fg: "#f5efe1" }, // river-deep
  { bg: "#b64235", fg: "#fdf4e7" }, // cinnabar
  { bg: "#9a6d2e", fg: "#17202a" }, // gold
  { bg: "#7c9b86", fg: "#17202a" }, // jade
];

function pickColour(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}

export function Avatar({
  src,
  name,
  seed,
  size = 40,
  shape = "round",
  className = "",
  ringClassName = "",
  alt,
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const colour = useMemo(
    () => pickColour((seed ?? name ?? "culvoy").toLowerCase()),
    [seed, name],
  );

  const showImage = Boolean(src);
  const fontSize = Math.max(11, Math.round(size * 0.4));

  return (
    <span
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden ${
        shape === "round" ? "rounded-full" : ""
      } ${ringClassName} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? "transparent" : colour.bg,
        color: colour.fg,
      }}
      role="img"
      aria-label={alt ?? name ?? "Avatar"}
    >
      <span
        aria-hidden="true"
        className="font-semibold tracking-wide"
        style={{ fontSize, lineHeight: 1 }}
      >
        {initials}
      </span>
      {showImage ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 block bg-cover bg-center"
          style={{ backgroundImage: `url("${src}")` }}
        />
      ) : null}
    </span>
  );
}
