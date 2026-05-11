import { Reveal } from "@/components/ui/Reveal";
import { ImageParallax } from "@/components/culture/ImageParallax";
import { MouseGlow } from "@/components/culture/MouseGlow";

type Props = {
  title: string;
  body: string;
  image: string;
  align?: "left" | "right";
  index: number;
  stat?: string;
  sectionId?: string;
};

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(Boolean);
}

function extractLeadSentence(text: string): string {
  const match = text.match(/^([^.!?]*[.!?])/);
  return match ? match[1] : "";
}

const DIAGONAL_CUT = "15%"; // how much the image diagonally cuts across

export function ArticleSplitScreen({ title, body, image, align = "left", index, stat, sectionId }: Props) {
  const isRight = align === "right";
  const paragraphs = splitIntoParagraphs(body);
  const leadSentence = extractLeadSentence(paragraphs[0] ?? "");
  const firstParaRemainder = paragraphs[0]
    ? paragraphs[0].slice(leadSentence.length).trim()
    : "";
  const remainingParas = paragraphs.slice(1);

  // Clip-paths: image diagonally bleeds into the text column
  const imageClipPath = isRight
    ? `polygon(${DIAGONAL_CUT} 0, 100% 0, 100% 100%, 0 100%)`
    : "polygon(0 0, 100% 0, calc(100% - " + DIAGONAL_CUT + ") 100%, 0 100%)";

  const imageBleed = isRight ? "-left-[12%] right-0" : "left-0 -right-[12%]";

  const content = (
    <div className="flex h-full flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className={`relative ${isRight ? "lg:mr-8" : "lg:ml-8"}`}>
        <p className="text-label text-[var(--cinnabar)]">{title}</p>

        {leadSentence && (
          <p className="mt-6 font-[family:var(--font-display)] text-xl leading-[1.35] text-[var(--river-deep)] sm:text-2xl sm:leading-[1.4]">
            {leadSentence}
          </p>
        )}

        {firstParaRemainder && (
          <p className="mt-5 text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
            {firstParaRemainder}
          </p>
        )}

        {remainingParas.map((para, i) => (
          <p
            key={i}
            className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8"
          >
            {para.trim()}
          </p>
        ))}

        {stat && (
          <div className="relative mt-8 overflow-hidden border-l-2 border-[var(--cinnabar)] bg-[var(--paper)] px-5 py-4 before:absolute before:inset-0 before:bg-[linear-gradient(90deg,var(--cinnabar)/8,transparent)]">
            <p className="relative text-sm leading-7 text-[var(--ink)]">{stat}</p>
          </div>
        )}
      </div>
    </div>
  );

  const imageBlock = (
    <MouseGlow className="relative min-h-[20rem] overflow-hidden sm:min-h-[28rem] lg:min-h-full">
      <ImageParallax className="absolute inset-0" speed={0.35}>
        <div
          className={`h-full w-full bg-cover bg-center ${imageBleed}`}
          style={{
            backgroundImage: `url(${image})`,
            clipPath: imageClipPath,
          }}
        />
      </ImageParallax>
    </MouseGlow>
  );

  return (
    <Reveal delay={index * 120}>
      <section id={sectionId} className="border-b border-[var(--line)] last:border-b-0">
        <div className="grid lg:grid-cols-2">
          {isRight ? (
            <>
              {content}
              {imageBlock}
            </>
          ) : (
            <>
              {imageBlock}
              {content}
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}
