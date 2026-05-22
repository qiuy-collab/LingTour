"use client";

import { useMemo, useState } from "react";
import type { CommunityFeedPost } from "@/lib/api-data";

type PostCardProps = {
  post: CommunityFeedPost;
  index: number;
  variant?: "image" | "feature" | "text";
  onOpen?: (post: CommunityFeedPost) => void;
};

const FALLBACK_AVATAR = "/uploads/seed/zhanjiang-hero-1200.jpg";

export function PostCard({
  post,
  index,
  variant = "image",
  onOpen,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesDelta, setLikesDelta] = useState(0);
  const [savesDelta, setSavesDelta] = useState(0);

  const likeCount = post.likes + likesDelta;
  const saveCount = post.saves + savesDelta;
  const hasImage = Boolean(post.image);
  const hasText = Boolean(post.excerpt.trim());

  const variantClasses = useMemo(() => {
    if (variant === "text") {
      return "border border-[var(--line)] bg-[var(--paper)]/95 rotate-[-0.8deg]";
    }
    if (variant === "feature") {
      return "overflow-hidden border border-[var(--line)] bg-[linear-gradient(180deg,rgba(250,248,242,0.98),rgba(244,240,232,0.92))]";
    }
    return "journal-paper";
  }, [variant]);

  const openPost = () => onOpen?.(post);

  return (
    <article
      className={`group relative scrapbook-shadow transition-all duration-500 hover:-translate-y-1 ${variantClasses}`}
      style={{
        borderRadius:
          variant === "image"
            ? "2px 40px 5px 35px"
            : variant === "feature"
              ? "1.9rem"
              : "1.6rem 1.6rem 1.2rem 1.8rem",
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={openPost}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPost();
          }
        }}
        className="block w-full cursor-pointer text-left"
      >
        {hasImage ? (
          <div
            className={`relative overflow-hidden ${
              variant === "feature"
                ? "aspect-[1.12] border-b border-[var(--line)]"
                : variant === "image"
                  ? "tape-effect aspect-[1.1] rounded-[4px]"
                  : "aspect-[1.18] rounded-t-[1.5rem]"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 ${
                variant === "image" ? "grayscale-[0.12]" : "grayscale-[0.04]"
              }`}
              style={{ backgroundImage: `url(${post.image})` }}
            />
            <div
              className={`absolute inset-0 ${
                variant === "feature"
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(17,25,35,0.18))]"
                  : "bg-gradient-to-t from-black/36 to-transparent"
              }`}
            />
            <div
              className={`absolute right-3 top-3 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                variant === "feature"
                  ? "rounded-full border border-[var(--line)] bg-[var(--paper)]/88 text-[var(--cinnabar)] backdrop-blur-md"
                  : "handwritten rotate-[2deg] bg-white/80 text-[var(--river-deep)] shadow-sm backdrop-blur-sm"
              }`}
            >
              {post.channel}
            </div>
            {variant === "feature" ? (
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-[family:var(--font-display)] text-3xl leading-[0.95] text-white [text-shadow:0_2px_16px_rgba(17,25,35,0.45)]">
                  {post.title}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative overflow-hidden px-6 pb-2 pt-8 sm:px-7">
            <div className="absolute right-6 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
              Text Dispatch
            </div>
            <div className="max-w-[13rem] border-l-2 border-[var(--gold)] pl-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                {post.channel}
              </p>
              <p className="mt-3 handwritten text-[var(--muted)]">
                No image attached. Filed as a pure note.
              </p>
            </div>
          </div>
        )}

        <div
          className={`${
            variant === "feature"
              ? "p-5"
              : variant === "text"
                ? "p-6 sm:p-7"
                : "p-5"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full bg-cover bg-center ${
                variant === "feature"
                  ? "border border-[var(--paper)]/70 ring-2 ring-white/50"
                  : "border border-white/40 ring-2 ring-[var(--paper-deep)]"
              }`}
              style={{ backgroundImage: `url(${post.user.avatar || FALLBACK_AVATAR})` }}
            />
            <span
              className={`text-sm ${
                variant === "image" ? "handwritten" : "font-medium"
              } text-[var(--river-deep)]`}
            >
              {post.user.name}
            </span>
          </div>

          {variant !== "feature" ? (
            <h2
              className={`mt-4 font-[family:var(--font-display)] leading-tight ${
                variant === "text"
                  ? "text-3xl text-[var(--river-deep)]"
                  : "text-2xl text-[var(--river-deep)] underline decoration-[var(--gold)]/30 decoration-2 underline-offset-4"
              }`}
            >
              {post.title}
            </h2>
          ) : null}

          {hasText ? (
            <p
              className={`mt-4 ${
                variant === "feature"
                  ? "text-sm leading-7 text-[var(--river-deep)]/76"
                  : variant === "text"
                    ? "text-base leading-8 text-[var(--river-deep)]/80 handwritten"
                    : "text-sm italic leading-relaxed text-[var(--muted)] line-clamp-3"
              }`}
            >
              {variant === "image" ? `“${post.excerpt}”` : post.excerpt}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-[var(--muted)]">
              Photo-only signal. Open to read context and replies.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--paper-deep)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cinnabar)]">
              #{post.route}
            </span>
            <span className="rounded-full bg-[var(--paper-deep)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
              @{post.location}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-[var(--river-deep)]">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!liked) {
                    setLiked(true);
                    setLikesDelta((d) => d + 1);
                    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
                    fetch(`${apiBase}/public/community/posts/${post.id}/like`, { method: "POST" }).catch(() => {});
                  }
                }}
                className={`text-xs transition-colors ${
                  liked
                    ? "text-[var(--cinnabar)]"
                    : "text-[var(--muted)] hover:text-[var(--cinnabar)]"
                }`}
              >
                ♥ {likeCount}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openPost();
                }}
                className="text-xs text-[var(--muted)] hover:text-[var(--river-deep)]"
              >
                ✎ {post.comments}
              </button>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (!saved) {
                  setSaved(true);
                  setSavesDelta((d) => d + 1);
                  const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
                  fetch(`${apiBase}/public/community/posts/${post.id}/save`, { method: "POST" }).catch(() => {});
                }
              }}
              className={`text-xs transition-colors ${
                saved
                  ? "text-[var(--gold)]"
                  : "text-[var(--muted)] hover:text-[var(--gold)]"
              }`}
            >
              {saveCount} saved
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
