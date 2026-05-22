import { PLACEHOLDERS, type PlaceholderShape } from "@/lib/placeholders";

type Props = {
  /** Aspect / orientation. Defaults to "hero" (16:9). */
  shape?: PlaceholderShape;
  /**
   * Optional editorial label rendered as an overlay (e.g. "Hero · Zhanjiang").
   * Used to communicate to ops which slot still needs content; rendered subtly
   * so it doesn't break the page when seen by a real visitor.
   */
  label?: string;
  /** Optional reference code shown bottom-right (e.g. "LT-HOME-HERO"). */
  code?: string;
  /** Visual frame: "ledger" (default) keeps a thin paper border; "bare" removes it. */
  frame?: "ledger" | "bare";
  className?: string;
};

/**
 * <FieldPlaceholder>
 *
 * Component-layer placeholder for slots that *should* eventually be filled
 * by the CMS. Renders a Journal-style paper card with optional editorial
 * label and reference code.
 *
 * Pairs with @/lib/placeholders for raw SVG URLs (when only a string is OK).
 */
export function FieldPlaceholder({
  shape = "hero",
  label,
  code,
  frame = "ledger",
  className,
}: Props) {
  const src = PLACEHOLDERS[shape];

  const frameClass =
    frame === "ledger"
      ? "border border-[var(--line)]"
      : "";

  return (
    <div
      className={[
        "relative isolate overflow-hidden bg-[var(--paper-deep)]",
        frameClass,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Background SVG carries the bulk of the visual */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
      />

      {/* Editorial overlay (label + code), only shown if provided */}
      {(label || code) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5">
          {label ? (
            <span className="self-start font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--river-deep)]/60">
              ✦ {label}
            </span>
          ) : (
            <span />
          )}
          {code ? (
            <span className="self-end font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--river-deep)]/55">
              {code}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
