"use client";

import { useState } from "react";
import type { HomeVideo } from "@/types/content";
import { useLocale } from "@/lib/locale-context";

type HomeVideoChapterProps = {
  video: HomeVideo;
  fallbackPoster?: string;
};

function embedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}?autoplay=1`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function HomeVideoChapter({ video, fallbackPoster }: HomeVideoChapterProps) {
  const { t } = useLocale();
  const [started, setStarted] = useState(false);
  const poster = video.poster || fallbackPoster;
  const externalEmbed = embedUrl(video.url);

  return (
    <section className="site-container py-14 sm:py-20 lg:py-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end lg:gap-12">
        <div className="relative border-[0.55rem] border-white bg-[var(--night)] scrapbook-shadow sm:border-[0.85rem] sm:-rotate-1">
          <div className="absolute -top-5 left-[18%] z-20 h-9 w-28 -rotate-2 bg-[var(--paper)]/72 tape-effect" />
          <div className="relative aspect-video overflow-hidden bg-[var(--night)]">
            {started ? (
              externalEmbed ? (
                <iframe
                  src={externalEmbed}
                  title={video.title || t("home.video.defaultTitle")}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <video
                  src={video.url}
                  poster={poster}
                  autoPlay
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )
            ) : (
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="group absolute inset-0 grid h-full w-full place-items-center overflow-hidden bg-[var(--night)] text-white"
                aria-label={t("home.video.play")}
              >
                {poster ? (
                  <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                ) : null}
                <span className="absolute inset-0 bg-black/25" />
                <span className="relative z-10 grid h-20 w-20 place-items-center rounded-full border border-white/70 bg-[var(--night)]/72 shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition-transform group-hover:scale-105">
                  <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>

        <aside className="border-t border-[var(--line)] pt-6 lg:pb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
            {t("home.video.eyebrow")}
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-3xl leading-[1.05] text-[var(--river-deep)]">
            {video.title || t("home.video.defaultTitle")}
          </h2>
          {video.description ? (
            <p className="handwritten mt-4 text-sm leading-relaxed text-[var(--muted)]">
              {video.description}
            </p>
          ) : null}
          <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-5 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <div>
              <dt>{t("home.video.duration")}</dt>
              <dd className="mt-2 text-sm normal-case tracking-normal text-[var(--river-deep)]">{video.duration || "—"}</dd>
            </div>
            <div>
              <dt>{t("home.video.resolution")}</dt>
              <dd className="mt-2 text-sm normal-case tracking-normal text-[var(--river-deep)]">{video.resolution || "—"}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-7 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)] underline decoration-[var(--cinnabar)]/35 underline-offset-4"
          >
            {t("home.video.watch")} <span aria-hidden>→</span>
          </button>
        </aside>
      </div>
    </section>
  );
}
