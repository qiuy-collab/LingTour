"use client";

import { useState } from "react";
import type { CommunityPost } from "@/data/mock/community-posts";

type PostCardProps = {
  post: CommunityPost;
  index: number;
  variant?: "image" | "feature" | "text";
};

export function PostCard({ post, index, variant = "image" }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<string[]>([]);

  const likeCount = liked ? post.likes + 1 : post.likes;
  const saveCount = saved ? post.saves + 1 : post.saves;
  const isFeature = variant === "feature";
  const isText = variant === "text";
  const isJournal = variant === "image"; // Using default "image" as the basis for Journal upgrade

  const submitReply = () => {
    const clean = reply.trim();
    if (!clean) return;
    setLocalReplies((items) => [clean, ...items]);
    setReply("");
    setShowThread(true);
  };

  if (isJournal) {
    return (
      <article
        className="group relative scrapbook-shadow journal-paper p-5 transition-all duration-500 hover:-translate-y-2 hover:rotate-1"
        style={{
          borderRadius: "2px 40px 5px 35px",
          animationDelay: `${index * 60}ms`,
        }}
      >
        <div className="tape-effect relative aspect-[1.1] overflow-hidden rounded-[4px]">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale-[0.2] transition duration-700 group-hover:grayscale-0 group-hover:scale-110"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute right-3 top-3 handwritten bg-white/80 px-3 py-1 text-xs text-[var(--river-deep)] shadow-sm backdrop-blur-sm rotate-[2deg]">
            {post.channel}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full border border-white/40 bg-cover bg-center ring-2 ring-[var(--paper-deep)]"
              style={{ backgroundImage: `url(${post.user.avatar})` }}
            />
            <span className="handwritten text-sm text-[var(--river-deep)]">{post.user.name}</span>
          </div>

          <h2 className="font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] underline decoration-[var(--gold)]/30 decoration-2 underline-offset-4">
            {post.title}
          </h2>

          <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-3 italic">
            "{post.excerpt}"
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)] bg-[var(--paper-deep)] px-2 py-0.5 rounded">
              #{post.route}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] bg-[var(--paper-deep)] px-2 py-0.5 rounded">
              @{post.location}
            </span>
          </div>

          {showThread && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-[var(--paper-deep)] p-3 rounded-lg border border-black/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Live Thread</p>
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-[var(--river-deep)] border-l-2 border-[var(--gold)] pl-2">
                    "This is exactly what I was looking for. Saved to my route!"
                  </p>
                  {localReplies.map((reply, i) => (
                    <p key={i} className="text-xs leading-relaxed text-[var(--river-deep)] border-l-2 border-[var(--cinnabar)] pl-2">
                      "{reply}"
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Share a tip..."
                  className="flex-1 bg-white/50 border border-black/5 rounded-full px-4 py-1.5 text-xs outline-none focus:bg-white focus:border-[var(--gold)] transition-all"
                  onKeyDown={(e) => e.key === "Enter" && submitReply()}
                />
                <button
                  onClick={submitReply}
                  className="bg-[var(--river-deep)] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--cinnabar)] transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-black/5 pt-4">
            <div className="flex gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`text-xs flex items-center gap-1 transition-colors ${liked ? "text-[var(--cinnabar)]" : "text-[var(--muted)] hover:text-[var(--cinnabar)]"}`}
              >
                <span className="text-lg">♥</span> {likeCount}
              </button>
              <button
                onClick={() => setShowThread(!showThread)}
                className="text-xs text-[var(--muted)] hover:text-[var(--river-deep)] flex items-center gap-1"
              >
                <span>✎</span> {post.comments + localReplies.length}
              </button>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`handwritten text-sm transition-colors ${saved ? "text-[var(--gold)]" : "text-[var(--muted)]"}`}
            >
              {saved ? "Pinned" : "Pin it"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative overflow-hidden border border-[var(--line)] transition duration-500 ${
        isFeature
          ? "grid gap-0 rounded-[2.25rem] bg-[var(--night)] text-white shadow-[0_30px_90px_rgba(17,25,35,0.18)] lg:grid-cols-[1.1fr_0.9fr]"
          : isText
            ? "rounded-[2rem] bg-[var(--river-deep)] p-6 text-white shadow-[0_26px_80px_rgba(17,25,35,0.14)]"
            : "rounded-[2rem] bg-[rgba(248,244,236,0.82)] shadow-[0_22px_60px_rgba(17,25,35,0.08)] backdrop-blur hover:-translate-y-1 hover:bg-white hover:shadow-[0_34px_90px_rgba(17,25,35,0.13)]"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {!isText ? (
        <div className={`relative overflow-hidden ${isFeature ? "min-h-[21rem]" : "aspect-[1.08]"}`}>
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.04),rgba(17,25,35,0.66))]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/16 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {post.channel}
          </div>
          <button
            type="button"
            onClick={() => setSaved((value) => !value)}
            className={`absolute right-4 top-4 rounded-full px-3 py-2 text-xs font-bold backdrop-blur-md transition ${
              saved ? "bg-[var(--gold)] text-[var(--night)]" : "bg-white/16 text-white hover:bg-white hover:text-[var(--night)]"
            }`}
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-full border border-white/35 bg-cover bg-center shadow-lg"
                style={{ backgroundImage: `url(${post.user.avatar})` }}
              />
              <div>
                <p className="text-sm font-bold">{post.user.name}</p>
                <p className="text-xs text-white/68">{post.user.handle}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`${isFeature ? "grid content-between p-6 lg:p-8" : isText ? "" : "grid gap-5 p-5 sm:p-6"}`}>
        <div>
          <div className={`flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] ${isFeature || isText ? "text-white/50" : "text-[var(--muted)]"}`}>
            <span>{post.location}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-35" />
            <span>{post.route}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-35" />
            <span>{post.mood}</span>
          </div>

          <h2 className={`mt-4 font-[family:var(--font-display)] tracking-[-0.035em] ${
            isFeature ? "text-4xl leading-[0.98] lg:text-5xl" : isText ? "text-3xl leading-[1.02]" : "text-[1.75rem] leading-[1.02] text-[var(--river-deep)]"
          }`}>
            {post.title}
          </h2>
          <p className={`mt-4 text-[15px] leading-7 ${isFeature || isText ? "text-white/68" : "text-[var(--muted)]"}`}>
            {post.excerpt}
          </p>
        </div>

        <div className={`mt-5 rounded-2xl border p-4 ${isFeature || isText ? "border-white/12 bg-white/8" : "border-[var(--line)] bg-white/58"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isFeature || isText ? "text-[var(--gold)]" : "text-[var(--cinnabar)]"}`}>
            Field prompt
          </p>
          <p className={`mt-2 text-sm leading-6 ${isFeature || isText ? "text-white/76" : "text-[var(--river-deep)]"}`}>
            {post.prompt}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isFeature || isText
                  ? "border-white/12 bg-white/8 text-white/76"
                  : "border-[var(--line)] bg-white/64 text-[var(--river-deep)]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {showThread ? (
          <div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${isFeature || isText ? "bg-white/8 text-white/70" : "bg-[var(--paper)] text-[var(--muted)]"}`}>
            <p className={isFeature || isText ? "font-semibold text-white" : "font-semibold text-[var(--river-deep)]"}>Thread</p>
            <p className="mt-1">Saved this for my next Guangdong route. The timing note is exactly what I needed.</p>
            {localReplies.map((item, replyIndex) => (
              <p key={`${item}-${replyIndex}`} className="mt-3 border-t border-current/10 pt-3">
                {item}
              </p>
            ))}
          </div>
        ) : null}

        <div className={`mt-5 border-t pt-4 ${isFeature || isText ? "border-white/12" : "border-[var(--line)]"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiked((value) => !value)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  liked
                    ? "bg-[var(--cinnabar)] text-white"
                    : isFeature || isText
                      ? "bg-white/8 text-white hover:bg-white hover:text-[var(--night)]"
                      : "bg-white/70 text-[var(--river-deep)] hover:bg-[var(--cinnabar)] hover:text-white"
                }`}
                aria-pressed={liked}
              >
                {likeCount} likes
              </button>
              <button
                type="button"
                onClick={() => setShowThread((value) => !value)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isFeature || isText
                    ? "bg-white/8 text-white hover:bg-white hover:text-[var(--night)]"
                    : "bg-white/70 text-[var(--river-deep)] hover:bg-[var(--river-deep)] hover:text-white"
                }`}
              >
                {post.comments + localReplies.length} replies
              </button>
            </div>
            <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${isFeature || isText ? "text-white/42" : "text-[var(--muted)]"}`}>
              {saveCount} saved
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Add a quick reply"
              className={`h-10 min-w-0 flex-1 rounded-full border px-4 text-sm outline-none transition ${
                isFeature || isText
                  ? "border-white/12 bg-white/8 text-white placeholder:text-white/38 focus:border-white/34"
                  : "border-[var(--line)] bg-white/75 text-[var(--river-deep)] placeholder:text-[var(--muted)]/70 focus:border-[var(--cinnabar)]"
              }`}
            />
            <button
              type="button"
              onClick={submitReply}
              className="h-10 rounded-full bg-[var(--gold)] px-4 text-sm font-bold text-[var(--night)] transition hover:bg-white"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
