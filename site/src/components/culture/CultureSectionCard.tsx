import { Reveal } from "@/components/ui/Reveal";

type Props = {
  title: string;
  body: string;
  image: string;
  align?: "left" | "right";
  index: number;
};

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(Boolean);
}

function extractLeadSentence(text: string): string {
  const match = text.match(/^([^.!?]*[.!?])/);
  return match ? match[1] : "";
}

function getRemainingBody(text: string): string {
  const lead = extractLeadSentence(text);
  return lead ? text.slice(lead.length).trim() : text;
}

export function CultureSectionCard({ title, body, image, align = "left", index }: Props) {
  const isRight = align === "right";
  const paragraphs = splitIntoParagraphs(body);
  const leadSentence = extractLeadSentence(paragraphs[0] ?? "");
  const firstParagraphRemainder = paragraphs[0] ? paragraphs[0].slice(leadSentence.length).trim() : "";
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <Reveal delay={index * 150}>
      <section className="relative min-h-[32rem] overflow-hidden bg-[var(--night)] text-white lg:min-h-[36rem]">
        <div
          className="absolute inset-x-0 bottom-0 h-3/4 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${image})`,
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 38%, black 100%)",
            maskImage: "linear-gradient(180deg, transparent 0%, black 38%, black 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isRight
              ? "linear-gradient(270deg, rgba(17,25,35,0.94) 30%, rgba(17,25,35,0.6) 68%, rgba(17,25,35,0.3))"
              : "linear-gradient(90deg, rgba(17,25,35,0.94) 30%, rgba(17,25,35,0.6) 68%, rgba(17,25,35,0.3))",
          }}
        />
        <div
          className={`site-container relative z-10 flex min-h-[32rem] items-center py-12 lg:min-h-[36rem] lg:py-16 ${
            isRight ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-2xl space-y-5 ${
              isRight ? "text-right lg:mr-[6%]" : "text-left lg:ml-[6%]"
            }`}
          >
            <p className="text-label text-[var(--cinnabar)]">{title}</p>

            {/* Lead pull-quote sentence */}
            {leadSentence && (
              <p className="font-[family:var(--font-display)] text-xl leading-[1.35] text-white sm:text-2xl sm:leading-[1.4]">
                {leadSentence}
              </p>
            )}

            {/* First paragraph remainder */}
            {firstParagraphRemainder && (
              <p className="text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                {firstParagraphRemainder}
              </p>
            )}

            {/* Remaining paragraphs */}
            {remainingParagraphs.map((para, i) => (
              <p
                key={i}
                className="text-base leading-7 text-white/68 sm:text-lg sm:leading-8"
              >
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
