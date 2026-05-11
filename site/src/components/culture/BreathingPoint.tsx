import { Reveal } from "@/components/ui/Reveal";

type Props = {
  image: string;
  quote: string;
  attribution?: string;
};

export function BreathingPoint({ image, quote, attribution }: Props) {
  return (
    <Reveal>
      <section
        id={undefined}
        className="relative flex min-h-[50svh] items-center overflow-hidden bg-[var(--night)] text-white"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.88),rgba(17,25,35,0.48))]" />
        <div className="site-container relative">
          <div className="mx-auto max-w-2xl text-center">
            <svg
              className="mx-auto h-8 w-8 text-white/28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 10C10 7.79086 8.20914 6 6 6H4V8H6C7.10457 8 8 8.89543 8 10V11H4V16C4 17.1046 4.89543 18 6 18H10V10Z"
                fill="currentColor"
              />
              <path
                d="M20 10C20 7.79086 18.2091 6 16 6H14V8H16C17.1046 8 18 8.89543 18 10V11H14V16C14 17.1046 14.8954 18 16 18H20V10Z"
                fill="currentColor"
              />
            </svg>
            <p className="mt-6 font-[family:var(--font-display)] text-2xl leading-[1.35] text-white/88 sm:text-3xl sm:leading-[1.4]">
              {quote}
            </p>
            {attribution && (
              <p className="mt-6 text-sm uppercase tracking-[0.15em] text-white/48">{attribution}</p>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
