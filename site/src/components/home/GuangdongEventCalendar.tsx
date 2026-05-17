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
    <section className="site-container py-24 lg:py-40">
      <div className="grid gap-20 lg:grid-cols-[1fr_420px] items-start">
        {/* ─── Left: Calendar Log ─── */}
        <div className="flex flex-col">
          <Reveal>
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-px bg-[var(--gold)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                  {isZh ? "广东时令指南" : "Guangdong Seasonality"}
                </p>
              </div>
              <h2 className="font-[family:var(--font-display)] text-5xl md:text-7xl leading-[0.9] tracking-[-0.03em] text-[var(--river-deep)]">
                {isZh ? "风俗与节奏" : "Rituals & Rhythm."}
              </h2>
            </div>
          </Reveal>

          {/* Minimalist Month Navigator */}
          <div className="mb-10 flex items-center gap-12 border-b border-black/5 pb-8">
            <div className="flex gap-4">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center transition-all hover:bg-[var(--river-deep)] hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center transition-all hover:bg-[var(--river-deep)] hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <h3 className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] italic">
              {MONTH_NAMES[month]} <span className="text-[var(--gold)] not-italic ml-2">{year}</span>
            </h3>
          </div>

          {/* Log-style Grid */}
          <div className="grid grid-cols-7 gap-2">
            {DAY_NAMES.map((name) => (
              <div key={name} className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">
                {name}
              </div>
            ))}
            {weeks.flat().map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

              const dk = dateKey(year, month, day);
              const hasEvent = !!eventsByDate[dk];
              const isSel = dk === selectedDate;
              const isTdy = dk === todayStr;

              return (
                <button
                  key={dk}
                  onClick={() => setSelectedDate(dk)}
                  className={`group relative aspect-square flex flex-col items-center justify-center transition-all duration-500 ${
                    isSel ? "text-[var(--cinnabar)]" : "text-[var(--river-deep)] hover:bg-white/40"
                  }`}
                >
                  {/* Large Watermark Number */}
                  <span className={`font-[family:var(--font-display)] text-2xl md:text-3xl transition-all ${isSel ? "scale-125 font-bold" : "opacity-30 group-hover:opacity-60"}`}>
                    {day}
                  </span>

                  {isTdy && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--cinnabar)]" />}

                  {hasEvent && (
                    <div className={`mt-1 w-1 h-1 rounded-full ${isSel ? "bg-[var(--cinnabar)] animate-pulse" : "bg-[var(--gold)]"}`} />
                  )}

                  {isSel && (
                    <div className="absolute inset-0 border-2 border-[var(--cinnabar)]/20 rotate-3 scrapbook-shadow -z-10" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Events: Dispatch Style */}
          <div className="mt-16 space-y-6">
            {activeEvents.map((ev) => (
              <div key={ev.id} className="relative pl-8 border-l border-[var(--gold)]/30">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[var(--gold)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-2">Event Registry</p>
                <h4 className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] mb-3">{ev.title}</h4>
                <p className="text-sm leading-relaxed text-[var(--muted)] handwritten max-w-lg">{ev.summary ?? "A cultural landmark in the seasonal calendar of Guangdong."}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: The "Clipped" Route Preview ─── */}
        <div className="sticky top-32">
          {relatedRoute ? (
            <Reveal delay={200}>
              <Link href={`/routes/${relatedRoute.slug}`} className="group block relative">
                <div className="bg-white p-6 scrapbook-shadow -rotate-2 border border-black/5 transition-all duration-700 group-hover:rotate-0 group-hover:scale-[1.02]">
                  <div className="relative aspect-[3/4] overflow-hidden mb-8">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${relatedRoute.image})` }}
                    />
                    {/* Tape effect */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-[var(--paper)]/60 backdrop-blur-sm -rotate-3 z-20" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 border border-[var(--gold)] text-[9px] font-bold uppercase text-[var(--gold)]">Verified Route</span>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{relatedRoute.duration}</span>
                    </div>
                    <h4 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                      {relatedRoute.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-2">
                      {relatedRoute.summary}
                    </p>
                    <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between text-[var(--cinnabar)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Explore Intelligence</span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Annotation shadow */}
                <div className="absolute -bottom-6 -right-6 handwritten text-3xl text-[var(--gold)]/30 -rotate-12 select-none">
                  Live Dispatch
                </div>
              </Link>
            </Reveal>
          ) : (
            <div className="aspect-[3/4] border-2 border-dashed border-[var(--line)] flex items-center justify-center p-12 text-center rotate-1">
              <p className="text-sm text-[var(--muted)] handwritten opacity-40">
                Select a marked date to <br /> reveal the recommended route.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
