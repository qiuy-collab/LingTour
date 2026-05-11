"use client";

import { useEffect, useState, useRef } from "react";

import { fetchCities } from "@/lib/api-data";

type FormData = {
  name: string;
  contact: string;
  city: string;
  date: string;
  mode: string;
  groupSize: string;
  needs: string;
};

type Props = {
  prefillNeeds?: string;
  prefillCity?: string;
};

const serviceModes = [
  "City companion interpreting",
  "Story route guided support",
  "Group and study visit",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MultiStepForm({ prefillNeeds, prefillCity }: Props) {
  const [cities, setCities] = useState<string[]>(["Zhanjiang"]);
  const [step, setStep] = useState(0);
  const [fastTrack, setFastTrack] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    contact: "",
    city: "Zhanjiang",
    date: "",
    mode: "Story route guided support",
    groupSize: "",
    needs: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchCities("en").then((data) => {
      setCities(data.map((c) => c.name));
    }).catch(() => { /* keep default */ });
  }, []);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // Apply prefills
  useEffect(() => {
    if (prefillNeeds) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      update("needs", prefillNeeds);
    }
    if (prefillCity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      update("city", prefillCity);
    }
  }, [prefillNeeds, prefillCity]);

  // Close calendar on outside click
  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  const totalSteps = fastTrack ? 1 : 3;

  const canNext = (): boolean => {
    if (fastTrack) {
      return !!form.name && !!form.contact && !!form.city;
    }
    if (step === 0) return !!form.name && !!form.contact && !!form.city && !!form.date;
    if (step === 1) return !!form.mode && !!form.groupSize && !!form.needs;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Calendar helpers
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleCalendarSelect = (day: number) => {
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const iso = d.toISOString().split("T")[0];
    update("date", iso);
    setShowCalendar(false);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (submitted) {
    return (
      <div className="border border-[var(--gold)]/30 bg-[var(--paper)] p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5A039" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-6 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] sm:text-3xl">
          Request received
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
          {fastTrack
            ? "We will review your Fast Track request and respond within 12 hours with a suggested support scope."
            : "We will review your brief and respond within 24 hours with a suggested support scope, timing, and the simplest working format for your day."}
        </p>
        <p className="mt-6 text-label text-[var(--gold)]">Thank you for reaching out.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      {/* Fast Track toggle */}
      <div className="border-b border-[var(--line)] bg-[var(--paper)] px-6 py-3 sm:px-8 sm:py-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={fastTrack}
            onChange={(e) => {
              setFastTrack(e.target.checked);
              setStep(0);
            }}
            className="h-4 w-4 accent-[var(--cinnabar)]"
          />
          <span className="text-sm font-medium text-[var(--ink)]">Fast Track</span>
          <span className="text-xs text-[var(--muted)]">Quick booking — name, contact, and city only</span>
        </label>
      </div>

      {/* Progress bar */}
      <div className="border-b border-[var(--line)] bg-[var(--paper)] px-6 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between">
          <p className="text-label text-[var(--gold)]">
            Step {step + 1} of {totalSteps}
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {fastTrack
              ? "Quick booking"
              : step === 0
                ? "Your details"
                : step === 1
                  ? "Service needs"
                  : "Review"}
          </p>
        </div>
        <div className="mt-3 flex h-1 gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-[var(--gold)]" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form body */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {/* Fast Track: single step */}
        {fastTrack && (
          <div className="grid gap-4 transition-opacity duration-300 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Name</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Email / WhatsApp</span>
              <input
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                placeholder="Preferred contact"
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              >
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Normal Step 0: Your details */}
        {!fastTrack && step === 0 && (
          <div className="grid gap-4 transition-opacity duration-300 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Name</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Email / WhatsApp</span>
              <input
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                placeholder="Preferred contact"
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              >
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Service date</span>
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex w-full items-center justify-between border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition hover:border-[var(--gold)]/60"
                >
                  <span className={form.date ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
                    {form.date ? formatDate(form.date) : "Select date"}
                  </span>
                  <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M3 10h18" strokeLinecap="round" />
                    <path d="M8 2v4M16 2v4" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Calendar dropdown */}
                {showCalendar && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-64 border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                    {/* Month nav */}
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="grid h-7 w-7 place-items-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                      >
                        ←
                      </button>
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                        className="grid h-7 w-7 place-items-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                      >
                        →
                      </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="mb-1 grid grid-cols-7">
                      {WEEKDAYS.map((d) => (
                        <p key={d} className="text-center text-[10px] uppercase tracking-wider text-[var(--muted)]">
                          {d}
                        </p>
                      ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: firstDayOfMonth(calendarMonth) }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth(calendarMonth) }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const isSelected = form.date === dateStr;
                        const isToday = new Date().toISOString().split("T")[0] === dateStr;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleCalendarSelect(day)}
                            className={`grid h-8 w-8 place-items-center rounded-full text-xs transition ${
                              isSelected
                                ? "bg-[var(--cinnabar)] text-white"
                                : isToday
                                  ? "border border-[var(--cinnabar)] text-[var(--cinnabar)]"
                                  : "text-[var(--ink)] hover:bg-[var(--paper-deep)]"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Normal Step 1: Service needs */}
        {!fastTrack && step === 1 && (
          <div className="grid gap-4 transition-opacity duration-300">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Support mode</span>
              <select
                value={form.mode}
                onChange={(e) => update("mode", e.target.value)}
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              >
                {serviceModes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Group size</span>
              <input
                value={form.groupSize}
                onChange={(e) => update("groupSize", e.target.value)}
                placeholder="1-2 / 3-6 / larger group"
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Route or support need
              </span>
              <textarea
                value={form.needs}
                onChange={(e) => update("needs", e.target.value)}
                rows={5}
                placeholder="Tell us your route, time window, language needs, food or history interests, and any practical constraints."
                className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
              />
            </label>
          </div>
        )}

        {/* Normal Step 2: Review */}
        {!fastTrack && step === 2 && (
          <div className="grid gap-4 transition-opacity duration-300">
            <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
              <p className="text-label text-[var(--gold)]">Review your request</p>
              <div className="mt-4 grid gap-3 text-sm">
                {[
                  ["Name", form.name],
                  ["Contact", form.contact],
                  ["City", form.city],
                  ["Date", form.date ? formatDate(form.date) : ""],
                  ["Mode", form.mode],
                  ["Group size", form.groupSize],
                  ["Needs", form.needs],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-3 border-b border-[var(--line)] pb-2 last:border-0">
                    <span className="w-24 shrink-0 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      {label}
                    </span>
                    <span className={value ? "text-[var(--ink)]" : "italic text-[var(--muted)]"}>
                      {value || "Not provided"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--paper)] px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`text-sm transition ${
            step === 0
              ? "cursor-not-allowed text-[var(--muted)]/40"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
          disabled={step === 0}
        >
          ← Back
        </button>

        {fastTrack ? (
          <button
            type="button"
            onClick={() => {
              // Auto-fill defaults for Fast Track
              update("date", new Date().toISOString().split("T")[0]);
              update("mode", "City companion interpreting");
              update("groupSize", "1-2");
              update("needs", "Fast Track request — quick practical support");
              handleSubmit();
            }}
            disabled={!canNext()}
            className={`kinetic-link px-6 py-3 text-sm transition-all ${
              canNext()
                ? "bg-[var(--cinnabar)] text-white hover:bg-[var(--cinnabar-deep)]"
                : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
            }`}
          >
            Submit Fast Track
          </button>
        ) : step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className={`kinetic-link px-6 py-3 text-sm transition-all ${
              canNext()
                ? "bg-[var(--gold)] text-[var(--night)] hover:bg-[var(--gold)]/90"
                : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="kinetic-link bg-[var(--cinnabar)] px-6 py-3 text-sm text-white transition hover:bg-[var(--cinnabar-deep)]"
          >
            Submit request
          </button>
        )}
      </div>
    </div>
  );
}
