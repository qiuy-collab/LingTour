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
              body: locale === "zh" ? "\u57ce\u5e02\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u5feb\u901f\u9884\u7ea6" : "City, contact, and a quick brief",
            },
            {
              title: locale === "zh" ? "\u652f\u4ed8\u8ba2\u91d1" : "Pay Deposit",
              body: locale === "zh" ? "\u4fdd\u7559\u65f6\u6bb5\u5e76\u8fdb\u5165\u5339\u914d" : "Secure the slot and enter matching",
            },
          ]
        : [
            {
              title: locale === "zh" ? "\u57fa\u7840\u4fe1\u606f" : "Your Details",
              body: locale === "zh" ? "\u57ce\u5e02\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u51fa\u884c\u65e5\u671f" : "City, contact, and date",
            },
            {
              title: locale === "zh" ? "\u670d\u52a1\u504f\u597d" : "Service Needs",
              body: locale === "zh" ? "\u8def\u7ebf\u3001\u4eba\u6570\u3001\u53e3\u8bd1\u65b9\u5f0f" : "Mode, group size, and route",
            },
            {
              title: locale === "zh" ? "\u6700\u7ec8\u786e\u8ba4" : "Review Brief",
              body: locale === "zh" ? "\u63d0\u4ea4\u524d\u68c0\u67e5\u91cd\u70b9" : "Check the brief before payment",
            },
            {
              title: locale === "zh" ? "\u652f\u4ed8\u8ba2\u91d1" : "Pay Deposit",
              body: locale === "zh" ? "\u4fdd\u7559\u65f6\u6bb5\u5e76\u8fdb\u5165\u5339\u914d" : "Secure the slot and enter matching",
            },
          ],
    [bookingFastTrack, locale],
  );

  return (
    <section id="interpreting-booking" className="site-container pb-16 lg:pb-24">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <div className="mb-8 opacity-60">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              {locale === "zh" ? "\u9884\u7ea6" : "Booking"}
            </p>
            <h2 className="mt-3 max-w-[10ch] font-[family:var(--font-display)] text-[2.6rem] leading-[1.02] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap lg:text-3xl">
              {locale === "zh" ? "\u544a\u8bc9\u6211\u4eec\u4f60\u8981\u53bb\u54ea\u3002" : "Tell us where you are going."}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,236,0.82))] p-5 shadow-[0_18px_40px_rgba(17,25,35,0.06)]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cinnabar)]">
                  {locale === "zh" ? "\u5b9e\u65f6\u7b80\u62a5" : "Live Brief"}
                </p>
                <span className="rounded-full bg-[var(--gold)]/12 px-3 py-1 text-[11px] font-semibold text-[var(--cinnabar)]">
                  {bookingFastTrack ? "Fast Track" : `${bookingStep + 1}/3`}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {bookingSummary.map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--river-deep)] shadow-[0_8px_20px_rgba(17,25,35,0.05)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {bookingSteps.map((item, index) => {
                const isActive = !bookingFastTrack && bookingStep === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setBookingStep(index)}
                    className={[
                      "flex w-full items-start gap-4 rounded-[1.5rem] border p-4 text-left",
                      isActive
                        ? "border-[var(--cinnabar)] bg-white shadow-[0_14px_32px_rgba(140,58,44,0.12)]"
                        : "border-[var(--line)] bg-white/68 hover:border-[var(--gold)]/40 hover:bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full font-[family:var(--font-display)] text-lg",
                        isActive ? "bg-[var(--cinnabar)] text-white" : "bg-[var(--gold)]/12 text-[var(--cinnabar)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold leading-6 text-[var(--river-deep)]">{item.title}</span>
                      <span className="mt-1 block text-[13px] leading-6 text-[var(--muted)]">{item.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(17,25,35,0.04)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                {locale === "zh" ? "\u63d0\u793a" : "How it works"}
              </p>
              <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
                {bookingFastTrack
                  ? (locale === "zh"
                      ? "\u5f53\u524d\u662f Fast Track \u6a21\u5f0f\uff0c\u586b\u5199\u57fa\u7840\u4fe1\u606f\u540e\u9700\u652f\u4ed8\u8ba2\u91d1\u624d\u4f1a\u9501\u5b9a\u65f6\u6bb5\u3002"
                      : "Fast Track keeps it light. Fill the basics, then pay the deposit to secure the slot.")
                  : (locale === "zh"
                      ? "\u5de6\u8fb9\u6b65\u9aa4\u5361\u53ef\u76f4\u63a5\u5207\u6362\u53f3\u8fb9\u7684\u9636\u6bb5\uff0c\u63d0\u4ea4\u9700\u6c42\u540e\u8fd8\u9700\u652f\u4ed8\u8ba2\u91d1\u3002"
                      : "Use the cards on the left to move through the brief. After the request is sent, the deposit confirms the booking.")}
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-visible rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,236,0.98))] p-6 shadow-[0_20px_60px_rgba(17,25,35,0.08)] lg:p-10">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)]">
              {locale === "zh" ? "\u670d\u52a1\u53f0" : "Service Desk"}
            </p>
            <h3 className="mt-3 max-w-[12ch] font-[family:var(--font-display)] text-[2.6rem] leading-[1.02] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap lg:text-3xl">
              {locale === "zh" ? "\u63d0\u4ea4\u9884\u7ea6\u9700\u6c42" : "Build your request"}
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
