"use client";

import { useId, useState } from "react";

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
  filterLabel: string;
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
  filterLabel,
  allLabel,
  clearLabel,
  groups,
  onClear,
}: ArchiveFilterBarProps) {
  const filterPanelId = useId();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const hasFilters = Boolean(searchValue.trim() || groups.some((group) => group.value));
  const activeFilterCount = groups.filter((group) => group.value).length;

  return (
    <div className="mb-12 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/48 p-4 shadow-[0_14px_48px_rgba(17,25,35,0.05)] backdrop-blur-sm sm:mb-16 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 transition-colors focus-within:border-[var(--river-deep)] focus-within:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]">
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

        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <p aria-live="polite" className="whitespace-nowrap font-[family:var(--font-display)] text-base italic text-[var(--river-deep)] sm:text-lg">
            {countLabel}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-10 items-center rounded-full px-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/40 underline-offset-4"
            >
              {clearLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setFiltersExpanded((current) => !current)}
            aria-expanded={filtersExpanded}
            aria-controls={filterPanelId}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--river-deep)] bg-[var(--river-deep)] px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[var(--cinnabar)] hover:bg-[var(--cinnabar)]"
          >
            <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
            </svg>
            {filterLabel}
            {activeFilterCount ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[9px] text-[var(--river-deep)]">
                {activeFilterCount}
              </span>
            ) : null}
            <svg
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${filtersExpanded ? "rotate-180" : ""}`}
            >
              <path d="m3 6 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {filtersExpanded ? (
        <div id={filterPanelId} className="mt-5 space-y-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)]/62 p-4 sm:p-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <p className="w-24 shrink-0 pt-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                {group.label}
              </p>
              <div className="scrollbar-hide flex min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                <button
                  type="button"
                  onClick={() => group.onChange("")}
                  aria-pressed={!group.value}
                  className={`min-h-10 shrink-0 rounded-full border px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
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
                    className={`min-h-10 shrink-0 rounded-full border px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
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
      ) : null}
    </div>
  );
}
