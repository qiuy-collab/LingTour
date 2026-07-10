type FilterOption = {
  value: string;
  label: string;
};

type FilterGroup = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type ArchiveFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  countLabel: string;
  allLabel: string;
  clearLabel: string;
  groups: FilterGroup[];
  onClear: () => void;
};

export function ArchiveFilterBar({
  searchValue,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  countLabel,
  allLabel,
  clearLabel,
  groups,
  onClear,
}: ArchiveFilterBarProps) {
  const hasFilters = Boolean(searchValue.trim() || groups.some((group) => group.value));

  return (
    <div className="mb-12 border-y border-[var(--line)] py-6 sm:mb-16 sm:py-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <label className="flex max-w-md items-center gap-3 border-b border-[var(--line)] pb-3 transition-colors focus-within:border-[var(--river-deep)]">
            <span className="sr-only">{searchLabel}</span>
            <svg aria-hidden width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-[var(--muted)]">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-base text-[var(--river-deep)] outline-none placeholder:text-[var(--muted)]"
            />
          </label>

          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <p className="w-24 shrink-0 pt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                {group.label}
              </p>
              <div className="flex min-w-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => group.onChange("")}
                  aria-pressed={!group.value}
                  className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    !group.value
                      ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                      : "border-[var(--line)] bg-white/55 text-[var(--river-deep)] hover:border-[var(--river-deep)]"
                  }`}
                >
                  {allLabel}
                </button>
                {group.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => group.onChange(option.value)}
                    aria-pressed={group.value === option.value}
                    className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      group.value === option.value
                        ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                        : "border-[var(--line)] bg-white/55 text-[var(--river-deep)] hover:border-[var(--river-deep)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-6 border-t border-[var(--line)] pt-4 xl:border-0 xl:pt-1">
          <p className="font-[family:var(--font-display)] text-lg italic text-[var(--river-deep)]">
            {countLabel}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/40 underline-offset-4"
            >
              {clearLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
