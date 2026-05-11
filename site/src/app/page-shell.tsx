import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export function PageShell({ eyebrow, title, description, bullets }: PageShellProps) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="max-w-4xl rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 lg:p-12">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="rounded-[1.4rem] bg-white px-5 py-4 text-sm leading-7 text-[var(--ink)] shadow-[0_14px_35px_rgba(20,34,50,0.05)]"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
