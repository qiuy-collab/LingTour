"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import { mockEvents } from "@/data/mock/events";
import { storyRoutes } from "@/data/routes";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

// ───────────── Calendar helpers ─────────────

const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES_ZH = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

function dateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function GuangdongEventCalendar() {
  const { locale, t } = useLocale();
  const events = mockEvents[locale];
  const isZh = locale === "zh";
  const DAY_NAMES = isZh ? DAY_NAMES_ZH : DAY_NAMES_EN;
  const MONTH_NAMES = isZh ? MONTH_NAMES_ZH : MONTH_NAMES_EN;

  // Build lookup: date string → events[]
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const ev of events) {
      const d = ev.date; // "2026-05-28"
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    }
    return map;
  }, [events]);

  // Determine initial month from the first event
  const initialDate = events.length > 0
    ? new Date(events[0].date + "T00:00:00")
    : new Date();

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(
    events.length > 0 ? events[0].date : null,
  );

  const activeEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];
  const activeEvent = activeEvents[0] ?? null;

  const relatedRoute = useMemo(() => {
    if (!activeEvent || !activeEvent.relatedRouteSlugs.length) return null;
    return storyRoutes.find((r) => r.slug === activeEvent.relatedRouteSlugs[0]) ?? null;
  }, [activeEvent]);

  // ── Month navigation ──
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // ── Build calendar grid ──
  const totalDays = daysInMonth(year, month);
  const startDow = firstDayOfMonth(year, month);
  const todayStr = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Leading blanks
  for (let i = 0; i < startDow; i++) currentWeek.push(null);
  // Days
  for (let d = 1; d <= totalDays; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  // Trailing blanks
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <section className="site-container py-12 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_480px]">
        {/* ─── Left: Calendar ─── */}
        <div className="flex flex-col">
          <Reveal>
            <div className="mb-8 opacity-60">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                {isZh ? "广东时令指南" : "Guangdong Seasonality"}
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {isZh ? "风俗与节庆" : "Culture & Rhythm"}
              </h2>
            </div>
          </Reveal>

          {/* Month navigator */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
              aria-label="Previous month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="font-[family:var(--font-display)] text-xl tracking-tight text-[var(--river-deep)]">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
              aria-label="Next month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="mb-2 grid grid-cols-7">
            {DAY_NAMES.map((name) => (
              <div key={name} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]/50">
                {name}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="overflow-hidden rounded-xl border border-[var(--line)]/30 bg-white">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-[var(--line)]/20 last:border-b-0">
                {week.map((day, di) => {
                  if (day === null) {
                    return <div key={`empty-${di}`} className="aspect-square bg-[var(--paper-deep)]/50" />;
                  }

                  const dk = dateKey(year, month, day);
                  const hasEvent = !!eventsByDate[dk];
                  const isSel = dk === selectedDate;
                  const isTdy = dk === todayStr;
                  const eventCount = eventsByDate[dk]?.length ?? 0;

                  return (
                    <button
                      key={dk}
                      onClick={() => { setSelectedDate(dk); }}
                      className={`group relative flex aspect-square flex-col items-center justify-center transition-all duration-200 hover:bg-[var(--paper-deep)] ${
                        isSel
                          ? "bg-[var(--river-deep)] text-white"
                          : "bg-white text-[var(--ink)]"
                      }`}
                    >
                      {/* Today ring */}
                      {isTdy && !isSel && (
                        <div className="absolute inset-1 rounded-full border-2 border-[var(--cinnabar)]" />
                      )}
                      {isTdy && isSel && (
                        <div className="absolute inset-1 rounded-full border-2 border-[var(--gold)]" />
                      )}

                      <span className={`relative z-10 font-sans text-sm font-medium ${
                        isSel ? "text-white" : "text-[var(--ink)]"
                      }`}>
                        {day}
                      </span>

                      {/* Event dot(s) */}
                      {hasEvent && (
                        <div className="relative z-10 mt-0.5 flex gap-[2px]">
                          {eventCount <= 3 ? (
                            Array.from({ length: eventCount }).map((_, i) => (
                              <span
                                key={i}
                                className={`block h-1 w-1 rounded-full ${
                                  isSel ? "bg-[var(--gold)]" : "bg-[var(--cinnabar)]"
                                }`}
                              />
                            ))
                          ) : (
                            <span className={`block h-1 w-3 rounded-full ${
                              isSel ? "bg-[var(--gold)]" : "bg-[var(--cinnabar)]"
                            }`} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Selected date events summary */}
          {activeEvents.length > 0 && (
            <div className="mt-6 space-y-2 pl-1">
              {activeEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedDate(ev.date)}
                  className={`w-full text-left group cursor-pointer border-l-2 py-2 pl-4 transition-all ${
                    selectedDate === ev.date
                      ? "border-[var(--cinnabar)] bg-[var(--paper)]"
                      : "border-[var(--line)]/30 hover:border-[var(--cinnabar)]/50"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--river-deep)]">{ev.title}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[var(--muted)]">
                    <span className="font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                      {ev.date.split("-")[1]}.{ev.date.split("-")[2]}
                    </span>
                    <span>{ev.city}</span>
                    <span className="capitalize">{ev.tags[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Route Card Preview ─── */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[440px]">
            {relatedRoute ? (
              <Reveal key={relatedRoute.slug}>
                <Link href={`/routes/${relatedRoute.slug}`} className="group block">
                  <div className="lux-card relative aspect-[4/5] overflow-hidden bg-[var(--night)] shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${relatedRoute.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--night)]/90 via-transparent to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[var(--gold)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
                          {isZh ? "推荐路线" : "Recommended"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          {relatedRoute.duration}
                        </span>
                      </div>
                      <h4 className="font-[family:var(--font-display)] text-3xl leading-tight text-white">
                        {relatedRoute.title}
                      </h4>
                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/60">
                        {relatedRoute.summary}
                      </p>

                      <div className="mt-8 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                          {t("common.btn.explore")}
                        </span>
                        <div className="h-px flex-1 mx-6 bg-[var(--gold)]/30 transition-all duration-500 group-hover:bg-[var(--gold)]" />
                        <svg className="h-5 w-5 text-[var(--gold)] transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)]/40 bg-[var(--paper-deep)]/50">
                <p className="text-sm text-[var(--muted)]/60">
                  {isZh ? "选择一个有节庆的日期" : "Select a date with an event"}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]/40">
                  {isZh ? "查看推荐路线" : "to see recommended routes"}
                </p>
              </div>
            )}

            {/* Background decorative element */}
            <div className="absolute -inset-4 -z-10 rounded-3xl border border-[var(--line)]/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
