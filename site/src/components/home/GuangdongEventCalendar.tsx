"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import type { EventData } from "@/lib/api-data";
import type { StoryRoute } from "@/data/routes";
import { Reveal } from "@/components/ui/Reveal";

const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_NAMES_ZH = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function dateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

type Props = {
  events?: EventData[];
  routes?: StoryRoute[];
};

export function GuangdongEventCalendar({ events = [], routes = [] }: Props) {
  const { locale } = useLocale();
  const isZh = locale === "zh";
  const dayNames = isZh ? DAY_NAMES_ZH : DAY_NAMES_EN;
  const monthNames = isZh ? MONTH_NAMES_ZH : MONTH_NAMES_EN;

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventData[]> = {};
    for (const event of events) {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  const initialDate =
    events.length > 0 ? new Date(`${events[0].date}T00:00:00`) : new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    events[0]?.date ?? null,
  );

  const activeEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];
  const activeEvent = activeEvents[0] ?? null;

  const relatedRoute = useMemo(() => {
    if (!activeEvent?.relatedRouteSlugs.length) return null;
    return (
      routes.find((route) => route.slug === activeEvent.relatedRouteSlugs[0]) ??
      null
    );
  }, [activeEvent, routes]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((value) => value - 1);
      return;
    }
    setMonth((value) => value - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((value) => value + 1);
      return;
    }
    setMonth((value) => value + 1);
  }

  const totalDays = daysInMonth(year, month);
  const startDow = firstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const weeks: Array<Array<number | null>> = [];
  let currentWeek: Array<number | null> = [];

  for (let i = 0; i < startDow; i += 1) currentWeek.push(null);
  for (let day = 1; day <= totalDays; day += 1) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <section className="site-container py-24 lg:py-40">
      <div className="grid items-start gap-20 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col">
          <Reveal>
            <div className="mb-16">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-10 bg-[var(--gold)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                  {isZh ? "广东时令指南" : "Guangdong Seasonality"}
                </p>
              </div>
              <h2 className="font-[family:var(--font-display)] text-5xl leading-[0.9] tracking-[-0.03em] text-[var(--river-deep)] md:text-7xl">
                {isZh ? "风俗与节令。" : "Rituals & Rhythm."}
              </h2>
            </div>
          </Reveal>

          <div className="mb-10 flex items-center gap-12 border-b border-black/5 pb-8">
            <div className="flex gap-4">
              <button
                onClick={prevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition-all hover:bg-[var(--river-deep)] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition-all hover:bg-[var(--river-deep)] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <h3 className="font-[family:var(--font-display)] text-4xl italic text-[var(--river-deep)]">
              {monthNames[month]}{" "}
              <span className="ml-2 not-italic text-[var(--gold)]">{year}</span>
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((name) => (
              <div
                key={name}
                className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40"
              >
                {name}
              </div>
            ))}
            {weeks.flat().map((day, index) => {
              if (day === null)
                return <div key={`empty-${index}`} className="aspect-square" />;

              const key = dateKey(year, month, day);
              const hasEvent = Boolean(eventsByDate[key]?.length);
              const isSelected = key === selectedDate;
              const isToday = key === todayStr;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`group relative flex aspect-square flex-col items-center justify-center transition-all duration-500 ${
                    isSelected
                      ? "text-[var(--cinnabar)]"
                      : "text-[var(--river-deep)] hover:bg-white/40"
                  }`}
                >
                  <span
                    className={`font-[family:var(--font-display)] text-2xl transition-all md:text-3xl ${
                      isSelected
                        ? "scale-125 font-bold"
                        : "opacity-30 group-hover:opacity-60"
                    }`}
                  >
                    {day}
                  </span>

                  {isToday ? (
                    <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--cinnabar)]" />
                  ) : null}
                  {hasEvent ? (
                    <div
                      className={`mt-1 h-1 w-1 rounded-full ${isSelected ? "animate-pulse bg-[var(--cinnabar)]" : "bg-[var(--gold)]"}`}
                    />
                  ) : null}
                  {isSelected ? (
                    <div className="scrapbook-shadow absolute inset-0 -z-10 rotate-3 border-2 border-[var(--cinnabar)]/20" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-16 space-y-6">
            {activeEvents.length > 0 ? (
              activeEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative border-l border-[var(--gold)]/30 pl-8"
                >
                  <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[var(--gold)]" />
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    Event Registry
                  </p>
                  <h4 className="mb-3 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                    {event.title}
                  </h4>
                  <p className="handwritten max-w-lg text-sm leading-relaxed text-[var(--muted)]">
                    {event.summary ||
                      (isZh
                        ? "广东时令文化的一个重要节点。"
                        : "A meaningful moment in Guangdong's seasonal rhythm.")}
                  </p>
                </div>
              ))
            ) : (
              <div className="relative border-l border-[var(--line)]/60 pl-8">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[var(--line)]" />
                <p className="handwritten text-sm text-[var(--muted)]">
                  {isZh
                    ? "这一页暂时没有活动记录。"
                    : "No event dispatches are pinned to this date yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky top-32">
          {relatedRoute ? (
            <Reveal delay={200}>
              <Link
                href={`/routes/${relatedRoute.slug}`}
                className="group relative block"
              >
                <div className="-rotate-2 border border-black/5 bg-white p-6 scrapbook-shadow transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-0">
                  <div className="relative mb-8 aspect-[3/4] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${relatedRoute.image})` }}
                    />
                    <div className="absolute left-1/2 top-[-0.5rem] z-20 h-8 w-24 -translate-x-1/2 -rotate-3 bg-[var(--paper)]/60 backdrop-blur-sm" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="border border-[var(--gold)] px-3 py-1 text-[9px] font-bold uppercase text-[var(--gold)]">
                        Verified Route
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                        {relatedRoute.duration}
                      </span>
                    </div>
                    <h4 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                      {relatedRoute.title}
                    </h4>
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                      {relatedRoute.summary}
                    </p>
                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-6 text-[var(--cinnabar)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Explore Intelligence
                      </span>
                      <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="handwritten absolute -bottom-6 -right-6 -rotate-12 select-none text-3xl text-[var(--gold)]/30">
                  Live Dispatch
                </div>
              </Link>
            </Reveal>
          ) : (
            <div className="flex aspect-[3/4] rotate-1 items-center justify-center border-2 border-dashed border-[var(--line)] p-12 text-center">
              <p className="handwritten text-sm text-[var(--muted)] opacity-40">
                {isZh
                  ? "选择一个带标记的日期，查看推荐路线。"
                  : "Select a marked date to reveal the recommended route."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
