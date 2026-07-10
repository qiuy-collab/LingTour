"use client";

import { useCallback, useMemo, useState } from "react";

import { MultiStepForm } from "@/components/interpreting/MultiStepForm";

type BookingFormSnapshot = {
  name: string;
  contact: string;
  city: string;
  date: string;
  mode: string;
  groupSize: string;
  needs: string;
};

type Props = {
  locale: "en" | "zh";
  prefillNeeds?: string;
};

export function BookingSection({ locale, prefillNeeds }: Props) {
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingFastTrack, setBookingFastTrack] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormSnapshot>({
    name: "",
    contact: "",
    city: "Zhanjiang",
    date: "",
    mode: "Story-led route support",
    groupSize: "",
    needs: "",
  });

  const handleBookingStepChange = useCallback((step: number, fastTrack: boolean) => {
    setBookingStep(step);
    setBookingFastTrack(fastTrack);
  }, []);

  const handleBookingFastTrackChange = useCallback((fastTrack: boolean) => {
    setBookingFastTrack(fastTrack);
  }, []);

  const handleBookingStateChange = useCallback((state: BookingFormSnapshot) => {
    setBookingForm(state);
  }, []);

  const bookingSummary = useMemo(
    () => [
      bookingForm.city || (locale === "zh" ? "\u57ce\u5e02\u5f85\u5b9a" : "City pending"),
      bookingForm.date || (locale === "zh" ? "\u65e5\u671f\u5f85\u5b9a" : "Date pending"),
      bookingForm.mode || (locale === "zh" ? "\u670d\u52a1\u5f85\u5b9a" : "Mode pending"),
    ],
    [bookingForm.city, bookingForm.date, bookingForm.mode, locale],
  );

  const bookingSteps = useMemo(
    () =>
      bookingFastTrack
        ? [
            {
              title: locale === "zh" ? "\u57fa\u7840\u4fe1\u606f" : "Your Details",
              body: locale === "zh" ? "\u59d3\u540d \u00b7 \u8054\u7cfb\u65b9\u5f0f \u00b7 \u57ce\u5e02" : "Name \u00b7 Contact \u00b7 City",
            },
            {
              title: locale === "zh" ? "\u652f\u4ed8\u8ba2\u91d1" : "Pay Deposit",
              body: locale === "zh" ? "\u8ba2\u91d1 \u00b7 \u5339\u914d" : "Deposit \u00b7 Matching",
            },
          ]
        : [
            {
              title: locale === "zh" ? "\u57fa\u7840\u4fe1\u606f" : "Your Details",
              body: locale === "zh" ? "\u59d3\u540d \u00b7 \u8054\u7cfb\u65b9\u5f0f \u00b7 \u57ce\u5e02 \u00b7 \u65e5\u671f" : "Name \u00b7 Contact \u00b7 City \u00b7 Date",
            },
            {
              title: locale === "zh" ? "\u670d\u52a1\u504f\u597d" : "Service Needs",
              body: locale === "zh" ? "\u65b9\u5f0f \u00b7 \u4eba\u6570 \u00b7 \u8def\u7ebf" : "Mode \u00b7 Group \u00b7 Route",
            },
            {
              title: locale === "zh" ? "\u6700\u7ec8\u786e\u8ba4" : "Review Brief",
              body: locale === "zh" ? "\u9700\u6c42\u6458\u8981" : "Request Summary",
            },
            {
              title: locale === "zh" ? "\u652f\u4ed8\u8ba2\u91d1" : "Pay Deposit",
              body: locale === "zh" ? "\u8ba2\u91d1 \u00b7 \u5339\u914d" : "Deposit \u00b7 Matching",
            },
          ],
    [bookingFastTrack, locale],
  );

  return (
    <section id="interpreting-booking" className="site-container pb-28 md:pb-20 lg:pb-24">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <div className="mb-8 opacity-60">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              {locale === "zh" ? "\u9884\u7ea6" : "Booking"}
            </p>
            <h2 className="mt-3 max-w-[10ch] font-[family:var(--font-display)] text-[2.25rem] leading-[1.02] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap lg:text-3xl">
              {locale === "zh" ? "\u9884\u7ea6\u53e3\u8bd1\u670d\u52a1" : "Interpreter Booking"}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="border border-[var(--line)] bg-[var(--paper)] p-5 scrapbook-shadow rotate-[-0.5deg] sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                  {locale === "zh" ? "\u9700\u6c42\u8349\u7a3f" : "Request Draft"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    {bookingFastTrack ? "Fast Track" : `Step ${bookingStep + 1}/4`}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {bookingSummary.map((item) => (
                  <span key={item} className="px-3 py-1 border border-[var(--line)] bg-[var(--paper-deep)]/40 text-[11px] font-bold uppercase tracking-wider text-[var(--river-deep)] handwritten italic">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {bookingSteps.map((item, index) => {
                const isActive = !bookingFastTrack && bookingStep === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setBookingStep(index)}
                    className={[
                      "group flex w-full items-start gap-4 p-4 transition-all duration-500 sm:gap-6 sm:p-6",
                      isActive
                        ? "border border-[var(--line)] bg-[var(--paper)] scrapbook-shadow sm:translate-x-2"
                        : "opacity-40 hover:opacity-100 hover:translate-x-1",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 shrink-0 place-items-center border font-[family:var(--font-display)] text-xl",
                        isActive ? "border-[var(--cinnabar)] bg-[var(--cinnabar)] text-white rotate-3" : "border-[var(--line)] text-[var(--muted)] rotate-[-3deg]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <div className="text-left">
                      <span className={`block font-[family:var(--font-display)] text-xl leading-tight sm:text-2xl ${isActive ? 'text-[var(--river-deep)]' : 'text-[var(--muted)]'}`}>
                        {item.title}
                      </span>
                      <span className="mt-2 block text-[13px] leading-relaxed text-[var(--muted)] handwritten italic">
                        {item.body}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        <div className="relative overflow-visible border border-[var(--line)] bg-[var(--paper)] bg-grain p-6 scrapbook-shadow rotate-[0.3deg] sm:p-8 lg:p-12">
          <div className="absolute top-0 right-0 w-40 h-40 border-l border-b border-[var(--line)] opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)] mb-4">
              {locale === "zh" ? "\u53e3\u8bd1\u9884\u7ea6" : "Interpreting"}
            </p>
            <h3 className="mb-8 font-[family:var(--font-display)] text-3xl italic text-[var(--river-deep)] sm:mb-12 sm:text-5xl">
              {locale === "zh" ? "\u670d\u52a1\u9700\u6c42" : "Service Request"}
            </h3>
            <div className="mt-7">
              <MultiStepForm
                locale={locale}
                prefillNeeds={prefillNeeds}
                requestedStep={bookingStep}
                onStepChange={handleBookingStepChange}
                onFastTrackChange={handleBookingFastTrackChange}
                onStateChange={handleBookingStateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
