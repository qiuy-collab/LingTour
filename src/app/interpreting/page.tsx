import Link from "next/link";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { Reveal } from "@/components/ui/Reveal";
import { regionShowcase } from "@/data/home";
import { storyRoutes } from "@/data/routes";

const serviceModes = [
  {
    title: "City companion interpreting",
    price: "From RMB 680 / half day",
    body: "For independent visitors who need English support, cultural explanation, food ordering, transport help, and smooth on-site communication.",
    includes: ["English city support", "Local etiquette notes", "Restaurant and transit help"],
  },
  {
    title: "Story route guided support",
    price: "From RMB 1,280 / day",
    body: "For visitors following one of LingTour story routes. The interpreter keeps the route practical while explaining the cultural thread behind each stop.",
    includes: ["Route pacing", "Stop-by-stop storytelling", "Photo and menu assistance"],
  },
  {
    title: "Group and study visit",
    price: "Custom quote",
    body: "For universities, exchange groups, delegations, or cultural workshops that require a prepared itinerary and bilingual coordination.",
    includes: ["Pre-trip planning", "Group coordination", "Workshop or campus support"],
  },
];

const interpreterProfiles = [
  {
    name: "Culture Route Lead",
    language: "English / Mandarin / Cantonese support",
    focus: "Guangfu city history, Cantonese food, museum and neighborhood interpretation.",
  },
  {
    name: "Food & Local Life Host",
    language: "English / Mandarin support",
    focus: "Restaurant ordering, market walks, snack streets, tea etiquette, and daily-life translation.",
  },
  {
    name: "Study Visit Coordinator",
    language: "English / Mandarin support",
    focus: "Student groups, campus guests, company visits, schedules, check-ins, and group movement.",
  },
];

const bookingSteps = [
  "Choose city, date, group size, and route interest.",
  "We confirm language needs, pace, mobility, and must-see stops.",
  "You receive a route plan, meeting point, service scope, and quote.",
  "On the travel day, the interpreter supports communication and cultural explanation together.",
];

const faqs = [
  {
    question: "Is this a tour guide service or interpreting service?",
    answer:
      "It is designed as cultural interpreting plus travel support. The focus is communication, route context, local etiquette, and making the story understandable for international visitors.",
  },
  {
    question: "Can I book only restaurant or transport support?",
    answer:
      "Yes. Short support can be arranged for food streets, hotel check-in, station transfer, or a single cultural stop when full-day support is unnecessary.",
  },
  {
    question: "Do routes need to follow LingTour exactly?",
    answer:
      "No. LingTour routes are templates. Visitors can choose one story route, combine cities, or ask for a lighter version based on time and budget.",
  },
];

export default function InterpretingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[var(--night)] py-20 text-white lg:py-28">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_65%_35%,rgba(182,66,53,0.32),transparent_36%),linear-gradient(120deg,transparent,rgba(124,155,134,0.24))] lg:block" />
        <EditorialIntro
          className="relative"
          tone="dark"
          eyebrow="Interpreting service"
          title="Travel Guangdong with someone who can explain the story."
          description="LingTour interpreting connects practical travel help with cultural explanation: city movement, menus, tickets, etiquette, route storytelling, and on-site communication for international visitors."
          actions={
            <>
              <a href="#booking" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white kinetic-link">
                Start a booking request
              </a>
              <Link href="/routes" className="border border-white/18 px-6 py-4 text-center text-sm text-white/82">
                Browse story routes
              </Link>
            </>
          }
        />
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">Service modes</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                Choose the level of support.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
              The service is built for foreign visitors who may not need a formal tour, but do need a
              reliable person to connect language, transport, food, and local culture.
            </p>
          </Reveal>
        </div>
        <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] lg:grid-cols-3">
          {serviceModes.map((mode, index) => (
            <Reveal key={mode.title} delay={index * 100}>
              <article className="bg-[var(--paper)] p-7 lux-card">
                <p className="text-label text-[var(--cinnabar)]">{mode.price}</p>
                <h3 className="mt-5 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                  {mode.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{mode.body}</p>
                <div className="mt-7 grid gap-2">
                  {mode.includes.map((item) => (
                    <p key={item} className="border-l-2 border-[var(--cinnabar)] pl-3 text-sm text-[var(--ink)]">
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <Reveal>
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-label text-[var(--cinnabar)]">Route matching</p>
                <h2 className="mt-4 max-w-[24ch] font-[family:var(--font-display)] text-4xl leading-[1.1] text-[var(--river-deep)] md:text-[2.85rem] md:leading-[1.08]">
                  Start from a city or a story route.
                </h2>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storyRoutes.slice(0, 4).map((route, index) => (
              <Reveal key={route.slug} delay={index * 80}>
                <Link href={`/routes/${route.slug}`} className="block h-full bg-[var(--paper)] p-6 transition hover:bg-white lux-card">
                  <p className="text-label text-[var(--muted)]">{route.city}</p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                    {route.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{route.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">How booking works</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                Clear before the visit, flexible during the visit.
              </h2>
              <div className="mt-9 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
                {bookingSteps.map((step, index) => (
                  <Reveal key={step} delay={index * 90}>
                    <div className="grid gap-4 bg-white p-5 md:grid-cols-[5rem_1fr]">
                      <p className="font-[family:var(--font-display)] text-4xl text-[var(--cinnabar)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="text-base leading-8 text-[var(--ink)]">{step}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="bg-[var(--night)] p-7 text-white">
              <p className="text-label text-white/48">Interpreter profiles</p>
              <div className="mt-7 grid gap-5">
                {interpreterProfiles.map((profile, index) => (
                  <Reveal key={profile.name} delay={index * 80}>
                    <article className="border border-white/12 p-5">
                      <h3 className="font-[family:var(--font-display)] text-2xl">{profile.name}</h3>
                      <p className="mt-2 text-sm text-white/56">{profile.language}</p>
                      <p className="mt-4 text-sm leading-7 text-white/72">{profile.focus}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="booking" className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">Booking request</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                Send the basic travel brief.
              </h2>
              <p className="mt-6 text-base leading-8 text-[var(--muted)]">
                This static form is the front-end booking interface. Later it can connect to email,
                database, or order management.
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <form className="grid gap-4 bg-[var(--paper)] p-6 shadow-[var(--shadow-soft)]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Name
                  <input className="border border-[var(--line)] bg-white px-4 py-3 focus:outline-none focus:border-[var(--cinnabar)]" placeholder="Your name" />
                </label>
                <label className="grid gap-2 text-sm">
                  Email / WhatsApp
                  <input className="border border-[var(--line)] bg-white px-4 py-3 focus:outline-none focus:border-[var(--cinnabar)]" placeholder="Contact method" />
                </label>
                <label className="grid gap-2 text-sm">
                  City
                  <select className="border border-[var(--line)] bg-white px-4 py-3 focus:outline-none focus:border-[var(--cinnabar)]">
                    {regionShowcase.map((city) => (
                      <option key={city.slug}>{city.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Service date
                  <input type="date" className="border border-[var(--line)] bg-white px-4 py-3 focus:outline-none focus:border-[var(--cinnabar)]" />
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                Route or support need
                <textarea
                  className="min-h-32 border border-[var(--line)] bg-white px-4 py-3 focus:outline-none focus:border-[var(--cinnabar)]"
                  placeholder="Tell us your route, group size, language needs, and special interests."
                />
              </label>
              <button type="button" className="bg-[var(--cinnabar)] px-6 py-4 text-sm text-white kinetic-link">
                Submit request draft
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 100}>
              <article className="bg-[var(--paper)] p-6 lux-card">
                <h3 className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{faq.question}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
