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
  prefillNeeds?: string;
};

export function BookingSection({ prefillNeeds }: Props) {
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
    setBookingStep(0);
  }, []);

  const handleBookingStateChange = useCallback((state: BookingFormSnapshot) => {
    setBookingForm(state);
  }, []);

  const bookingSummary = useMemo(
    () => [
      bookingForm.city || "City pending",
      bookingForm.date || "Date pending",
      bookingForm.mode || "Mode pending",
    ],
    [bookingForm.city, bookingForm.date, bookingForm.mode],
  );

  const bookingSteps = useMemo(
    () =>
      bookingFastTrack
        ? [
            {
              title: "Your Details",
              body: "Name · Contact · City",
            },
            {
              title: "Pay Deposit",
              body: "Deposit · Matching",
            },
          ]
        : [
            {
              title: "Your Details",
              body: "Name · Contact · City · Date",
            },
            {
              title: "Service Needs",
              body: "Mode · Group · Route",
            },
            {
              title: "Review Brief",
              body: "Request Summary",
            },
            {
              title: "Pay Deposit",
              body: "Deposit · Matching",
            },
          ],
    [bookingFastTrack],
  );

  return (
    <section id="interpreting-booking" className="site-container scroll-mt-24 pb-28 md:pb-20 lg:pb-28">
      <div className="mb-10 grid gap-5 border-b border-[var(--line)] pb-8 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] sm:items-end lg:mb-14">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
            {"Booking desk"}
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.03em] text-[var(--river-deep)] sm:text-5xl lg:text-6xl">
            {"Shape the day together"}
          </h2>
        </div>
        <p className="max-w-md handwritten text-sm leading-7 text-[var(--muted)] sm:justify-self-end">
          {"Leave the essentials first. We will turn the field details into a clear working brief with you."}
        </p>
      </div>

      <div className="relative border-y border-[var(--line)] bg-[var(--paper)]/62 py-6 sm:p-6 lg:p-8">
        <span className="absolute -top-3 left-8 hidden h-6 w-28 rotate-[-1deg] bg-[rgba(236,229,214,0.9)] shadow-sm sm:block" aria-hidden="true" />

        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.66fr)_minmax(0,1.34fr)] lg:gap-10 xl:gap-14">
          <aside className="min-w-0 lg:border-r lg:border-[var(--line)] lg:pr-10">
            <div className="px-1 sm:px-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  {"Live field brief"}
                </p>
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                  {bookingFastTrack ? "Fast track" : `${String(bookingStep + 1).padStart(2, "0")} / 04`}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-[var(--line)] py-4">
                {bookingSummary.map((item) => (
                  <span key={item} className="handwritten text-[12px] italic leading-5 text-[var(--river-deep)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
              {bookingSteps.map((item, index) => {
                const isActive = bookingStep === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setBookingStep(index)}
                    aria-current={isActive ? "step" : undefined}
                    className={`group flex min-w-[14rem] snap-start items-start gap-3 border-l-2 px-4 py-4 text-left transition-[background-color,border-color,opacity,transform] duration-300 lg:min-w-0 lg:w-full ${
                      isActive
                        ? "border-[var(--cinnabar)] bg-white/80 opacity-100 lg:translate-x-1"
                        : "border-transparent opacity-45 hover:border-[var(--gold)]/45 hover:bg-white/40 hover:opacity-100"
                    }`}
                  >
                    <span className={`pt-0.5 font-[family:var(--font-display)] text-sm ${isActive ? "text-[var(--cinnabar)]" : "text-[var(--muted)]"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-[family:var(--font-display)] text-xl leading-none text-[var(--river-deep)]">
                        {item.title}
                      </span>
                      <span className="mt-2 block handwritten text-[11px] italic leading-5 text-[var(--muted)]">
                        {item.body}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex items-end justify-between gap-4 px-1 sm:px-0">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  {"Interpreting request"}
                </p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-3xl italic leading-none text-[var(--river-deep)] sm:text-4xl">
                  {"Your working brief"}
                </h3>
              </div>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)] sm:block">
                {"About 3 minutes"}
              </span>
            </div>

            <MultiStepForm
              prefillNeeds={prefillNeeds}
              requestedStep={bookingStep}
              onStepChange={handleBookingStepChange}
              onFastTrackChange={handleBookingFastTrackChange}
              onStateChange={handleBookingStateChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
