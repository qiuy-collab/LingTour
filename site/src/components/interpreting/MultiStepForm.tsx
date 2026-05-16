"use client";

import { memo, useEffect, useRef, useState } from "react";

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
  requestedStep?: number;
  onStateChange?: (state: FormData) => void;
  onStepChange?: (step: number, fastTrack: boolean) => void;
  onFastTrackChange?: (fastTrack: boolean) => void;
};

const serviceModes = [
  "City companion support",
  "Story-led route support",
  "Group or study visit support",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const inputClass =
  "rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-[15px] leading-6 text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60 focus:bg-[var(--paper)]";

function MultiStepFormInner({
  prefillNeeds,
  prefillCity,
  requestedStep,
  onStateChange,
  onStepChange,
  onFastTrackChange,
}: Props) {
  const [cities, setCities] = useState<string[]>(["Zhanjiang"]);
  const [step, setStep] = useState(0);
  const [fastTrack, setFastTrack] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    contact: "",
    city: "Zhanjiang",
    date: "",
    mode: "Story-led route support",
    groupSize: "",
    needs: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCities("en")
      .then((data) => setCities(data.map((c) => c.name)))
      .catch(() => {
        // Keep the fallback city list when the request fails.
      });
  }, []);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (prefillNeeds) {
      update("needs", prefillNeeds);
    }
    if (prefillCity) {
      update("city", prefillCity);
    }
  }, [prefillNeeds, prefillCity]);

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

  useEffect(() => {
    onStateChange?.(form);
  }, [form, onStateChange]);

  useEffect(() => {
    if (typeof requestedStep !== "number" || fastTrack) return;
    const clamped = Math.max(0, Math.min(2, requestedStep));
    if (clamped !== step) {
      setStep(clamped);
    }
  }, [fastTrack, requestedStep, step]);

  const totalSteps = fastTrack ? 1 : 3;

  const canNext = (): boolean => {
    if (fastTrack) {
      return !!form.name && !!form.contact && !!form.city;
    }
    if (step === 0) return !!form.name && !!form.contact && !!form.city && !!form.date;
    if (step === 1) return !!form.mode && !!form.groupSize && !!form.needs;
    return true;
  };

  const handleSubmit = () => setSubmitted(true);

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
    const d = new Date(`${iso}T00:00:00`);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (submitted) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--gold)]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,236,0.92))] p-8 text-center shadow-[0_18px_50px_rgba(17,25,35,0.08)] sm:p-12">
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
            ? "We will review your Fast Track request and reply within 12 hours with a simple next-step plan."
            : "We will review your brief and reply within 24 hours with the right level, timing, and support format for the day."}
        </p>
        <p className="mt-6 text-label text-[var(--gold)]">Thanks. We will be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,0.92)] shadow-[0_18px_50px_rgba(17,25,35,0.08)] backdrop-blur-sm">
      <div className="border-b border-[var(--line)] bg-[rgba(248,244,236,0.72)] px-6 py-4 sm:px-8 sm:py-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/72 px-4 py-3">
          <input
            type="checkbox"
            checked={fastTrack}
            onChange={(e) => {
              const checked = e.target.checked;
              setFastTrack(checked);
              setStep(0);
              onFastTrackChange?.(checked);
              onStepChange?.(0, checked);
            }}
            className="h-4 w-4 accent-[var(--cinnabar)]"
          />
          <span className="text-[15px] font-medium leading-6 text-[var(--ink)]">Fast Track</span>
          <span className="text-[13px] leading-6 text-[var(--muted)]">Shortest version: name, contact, city</span>
        </label>
      </div>

      <div className="border-b border-[var(--line)] bg-[rgba(248,244,236,0.72)] px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center justify-between">
          <p className="text-label text-[var(--gold)]">Step {step + 1} of {totalSteps}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {fastTrack ? "Quick booking" : step === 0 ? "Basics" : step === 1 ? "Needs" : "Review"}
          </p>
        </div>
        <div className="mt-3 flex h-1.5 gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full ${i <= step ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {fastTrack && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Email / WhatsApp</span>
              <input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="Best way to reach you" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">City</span>
              <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass}>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
        )}

        {!fastTrack && step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Email / WhatsApp</span>
              <input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="Best way to reach you" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">City</span>
              <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass}>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Service date</span>
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition hover:border-[var(--gold)]/60 hover:bg-[var(--paper)]"
                >
                  <span className={form.date ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
                    {form.date ? formatDate(form.date) : "Choose a date"}
                  </span>
                  <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M3 10h18" strokeLinecap="round" />
                    <path d="M8 2v4M16 2v4" strokeLinecap="round" />
                  </svg>
                </button>

                {showCalendar && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-[1.25rem] border border-[var(--line)] bg-white p-4 shadow-[0_18px_40px_rgba(17,25,35,0.12)]">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="grid h-7 w-7 place-items-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                      >
                        &lt;
                      </button>
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                        className="grid h-7 w-7 place-items-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                      >
                        &gt;
                      </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7">
                      {WEEKDAYS.map((d) => (
                        <p key={d} className="text-center text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{d}</p>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: firstDayOfMonth(calendarMonth) }).map((_, i) => <div key={`empty-${i}`} />)}
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

        {!fastTrack && step === 1 && (
          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Support mode</span>
              <select value={form.mode} onChange={(e) => update("mode", e.target.value)} className={inputClass}>
                {serviceModes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Group size</span>
              <input value={form.groupSize} onChange={(e) => update("groupSize", e.target.value)} placeholder="1-2, 3-6, or larger" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Route or support need</span>
              <textarea
                value={form.needs}
                onChange={(e) => update("needs", e.target.value)}
                rows={5}
                placeholder="Share the route, timing, language, interests, or anything that will help us shape the day."
                className="min-h-[140px] rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60 focus:bg-[var(--paper)]"
              />
            </label>
          </div>
        )}

        {!fastTrack && step === 2 && (
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(248,244,236,0.72)] p-5">
              <p className="text-label text-[var(--gold)]">Review your request</p>
              <div className="mt-4 grid gap-3 text-[15px] leading-7">
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
                    <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
                    <span className={value ? "text-[var(--ink)]" : "italic text-[var(--muted)]"}>{value || "Not provided"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--line)] bg-[rgba(248,244,236,0.72)] px-6 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => {
            setStep((s) => {
              const next = Math.max(0, s - 1);
              onStepChange?.(next, fastTrack);
              return next;
            });
          }}
          className={`text-[14px] transition ${step === 0 ? "cursor-not-allowed text-[var(--muted)]/40" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
          disabled={step === 0}
        >
          Back
        </button>

        {fastTrack ? (
          <button
            type="button"
            onClick={() => {
              update("date", new Date().toISOString().split("T")[0]);
              update("mode", "City companion support");
              update("groupSize", "1-2");
              update("needs", "Fast Track request - practical day support");
              handleSubmit();
            }}
            disabled={!canNext()}
            className={`rounded-full px-6 py-3 text-[14px] font-semibold transition-all ${
              canNext()
                ? "bg-[var(--cinnabar)] text-white shadow-[0_12px_30px_rgba(140,58,44,0.18)] hover:bg-[var(--cinnabar-deep)]"
                : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
            }`}
          >
            Send Fast Track
          </button>
        ) : step < 2 ? (
          <button
            type="button"
            onClick={() => {
              setStep((s) => {
                const next = Math.min(2, s + 1);
                onStepChange?.(next, fastTrack);
                return next;
              });
            }}
            disabled={!canNext()}
            className={`rounded-full px-6 py-3 text-[14px] font-semibold transition-all ${
              canNext()
                ? "bg-[var(--gold)] text-[var(--night)] shadow-[0_12px_30px_rgba(197,160,57,0.18)] hover:bg-[var(--gold)]/90"
                : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[var(--cinnabar)] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(140,58,44,0.18)] transition hover:bg-[var(--cinnabar-deep)]"
          >
            Send request
          </button>
        )}
      </div>
    </div>
  );
}

export const MultiStepForm = memo(MultiStepFormInner);
MultiStepForm.displayName = "MultiStepForm";
