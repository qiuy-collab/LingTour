import Link from "next/link";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    title: "Story before checklist",
    body: "We design Guangdong routes around cultural logic: city memory, food rhythm, family structures, craft, migration, and the way places explain each other.",
  },
  {
    title: "International first",
    body: "The platform speaks primarily to international visitors, so explanations avoid local shorthand and turn cultural context into clear, visitable stories.",
  },
  {
    title: "Service plus product",
    body: "Routes, interpreting, and store objects are connected. A visitor can read a city, book support, and take home an object from the same cultural thread.",
  },
];

const teamRoles = [
  "Product and front-end development",
  "Route research and cultural writing",
  "Interpreting service design",
  "Visual identity and store concepts",
];

const milestones = [
  {
    label: "01",
    title: "Research Guangdong culture",
    body: "Build route concepts from real city culture, public information, field-friendly places, and international visitor needs.",
  },
  {
    label: "02",
    title: "Turn routes into interface",
    body: "Use interactive maps, image-led cards, story axes, and booking flows to make culture easier to choose and understand.",
  },
  {
    label: "03",
    title: "Connect service and memory",
    body: "Add interpreting support and cultural products so the platform can move from inspiration to transaction.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[var(--night)] py-20 text-white lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-34"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.96),rgba(17,25,35,0.72),rgba(17,25,35,0.44))]" />
        <EditorialIntro
          className="relative"
          tone="dark"
          eyebrow="About LingTour"
          title="Guangdong travel, translated into stories visitors can follow."
          description="LingTour is a cultural travel service platform for international visitors exploring Guangdong. It connects real city culture, route storytelling, interpreting support, and Lingnan-inspired products into one experience."
        />
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">Positioning</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                Not a generic attraction list.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 100}>
                <article className="bg-[var(--paper)] p-6 lux-card">
                  <h3 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                    {value.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{value.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">Project team</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                Built by a student innovation team with a product mindset.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
                The project combines web development, cultural research, route design, service planning,
                and international-facing communication. The goal is to make a real MVP that can later
                support booking, content operations, and product sales.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/routes" className="bg-[var(--river-deep)] px-6 py-4 text-center text-sm text-white kinetic-link">
                  View routes
                </Link>
                <Link href="/interpreting#booking" className="border border-[var(--line)] bg-white px-6 py-4 text-center text-sm text-[var(--ink)]">
                  Reserve support
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
            {teamRoles.map((role, index) => (
              <Reveal key={role} delay={index * 90}>
                <div className="grid grid-cols-[4.5rem_1fr] bg-white">
                  <p className="border-r border-[var(--line)] p-5 font-[family:var(--font-display)] text-3xl text-[var(--cinnabar)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="p-5 text-base text-[var(--ink)]">{role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
        <Reveal>
          <div className="mb-10 max-w-3xl">
            <p className="text-label text-[var(--cinnabar)]">How we build</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Research becomes route, route becomes service.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {milestones.map((item, index) => (
            <Reveal key={item.label} delay={index * 110}>
              <article className="border border-[var(--line)] bg-[var(--paper)] p-6 lux-card">
                <p className="font-[family:var(--font-display)] text-5xl text-[var(--cinnabar)]">{item.label}</p>
                <h3 className="mt-8 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-container pb-16">
        <Reveal>
          <div className="bg-[var(--night)] p-8 text-white lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-label text-white/48">Contact</p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight md:text-5xl">
                  Want to test a route or discuss collaboration?
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/68">
                  hello@lingtour.cn / Guangzhou, Shantou, Meizhou, Foshan
                </p>
              </div>
              <Link href="/interpreting#booking" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white kinetic-link">
                Start a request
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
