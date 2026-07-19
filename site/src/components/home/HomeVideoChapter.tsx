"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeVideo } from "@/types/content";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type HomeVideoChapterProps = {
  video?: HomeVideo;
  fallbackPoster?: string;
};

const DEFAULT_GUANGZHOU_FILM = "/video/guangzhou-skyline.mp4";

function embedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1`
        : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).at(-1);
      return id
        ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&background=1&loop=1`
        : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function HomeVideoChapter({ video, fallbackPoster }: HomeVideoChapterProps) {
  const scope = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const filmUrl = video?.url?.trim() || DEFAULT_GUANGZHOU_FILM;
  const externalEmbed = embedUrl(filmUrl);
  const poster = video?.poster || fallbackPoster;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      videoRef.current?.pause();
      setPaused(true);
    }
  }, []);

  const togglePlayback = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
    } else {
      element.pause();
    }
  };

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          if (!context.conditions?.animate || !scope.current) return;
          const film = scope.current.querySelector<HTMLElement>("[data-home-film]");
          if (!film) return;

          gsap.fromTo(
            scope.current,
            { autoAlpha: 0, clipPath: "inset(12% 0 12% 0)" },
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0 0% 0)",
              duration: 1.1,
              ease: motionEase.enter,
              clearProps: "clipPath",
              scrollTrigger: {
                trigger: scope.current,
                start: "top 88%",
                once: true,
              },
            },
          );

          if (context.conditions?.desktop) {
            gsap.fromTo(
              film,
              { scale: 1.08, yPercent: -2 },
              {
                scale: 1.14,
                yPercent: 2,
                ease: "none",
                scrollTrigger: {
                  trigger: scope.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.7,
                },
              },
            );
          }
        },
      );

      return () => media.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      aria-label={video?.title || "Guangzhou skyline film"}
      className="pb-6 pt-12 sm:pb-8 sm:pt-16 lg:pb-10 lg:pt-24"
    >
      <div className="relative w-full border-[0.4rem] border-[var(--paper-deep)] bg-[var(--paper-deep)] shadow-[0_20px_60px_rgba(17,25,35,0.12)] sm:border-[0.7rem]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--night)] sm:aspect-video">
          {externalEmbed ? (
            <iframe
              data-home-film
              src={externalEmbed}
              title={video?.title || "Guangzhou skyline film"}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 h-full w-full scale-[1.02] border-0"
            />
          ) : (
            <video
              ref={videoRef}
              data-home-film
              src={filmUrl}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              aria-label={video?.title || "Guangzhou skyline film"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {!externalEmbed ? (
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={paused ? "Play Guangzhou skyline film" : "Pause Guangzhou skyline film"}
              aria-pressed={paused}
              className="absolute bottom-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/45 bg-[var(--night)]/58 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-[var(--night)]/78 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
            >
              <span aria-hidden className="text-sm font-bold leading-none">
                {paused ? "▶" : "Ⅱ"}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// Default footage: Slava Kol via Pexels, video 34058573, used under the Pexels License.
