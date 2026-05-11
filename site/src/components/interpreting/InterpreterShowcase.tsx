"use client";

import { Reveal } from "@/components/ui/Reveal";

export type InterpreterProfile = {
  id: string;
  name: string;
  specialty: string;
  languages: string;
  serviceCount: number;
  image: string;
  needsPrefill: string;
};

type Props = {
  profiles: InterpreterProfile[];
  onSelectGuide: (needsText: string) => void;
};

export function InterpreterShowcase({ profiles, onSelectGuide }: Props) {
  const handleSelect = (profile: InterpreterProfile) => {
    onSelectGuide(profile.needsPrefill);
    // Scroll to booking form
    const el = document.getElementById("interpreting-booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="site-container py-16 lg:py-24">
      <Reveal>
        <div className="mb-10">
          <p className="text-label text-[var(--cinnabar)]">Trust layer</p>
          <h2 className="mt-4 max-w-[14ch] font-[family:var(--font-display)] text-4xl leading-[1.08] text-[var(--river-deep)] md:text-5xl">
            Meet the interpreters who carry the story forward.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Each interpreter brings local knowledge, language fluency, and cultural depth to your day.
            Select a guide whose expertise matches your interests.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {profiles.map((profile, index) => (
          <Reveal key={profile.id} delay={index * 100}>
            <div className="group lux-card flex flex-col overflow-hidden border border-[var(--line)] bg-white transition hover:border-[var(--cinnabar)]">
              {/* Photo — grayscale to color */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--paper-deep)]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 grayscale group-hover:grayscale-0"
                  style={{ backgroundImage: `url(${profile.image})` }}
                />
                {/* Overlay badge */}
                <div className="absolute left-4 top-4">
                  <span className="border border-white/30 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {profile.specialty}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-[family:var(--font-display)] text-xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
                  {profile.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {profile.languages}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-label text-[var(--cinnabar)]">
                    {profile.serviceCount}+ services
                  </span>
                </div>

                {/* Select button */}
                <button
                  type="button"
                  onClick={() => handleSelect(profile)}
                  className="mt-auto pt-5 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-1"
                >
                  Select this guide →
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
