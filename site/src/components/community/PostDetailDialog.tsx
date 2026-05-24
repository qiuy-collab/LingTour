"use client";

import { useEffect, useMemo } from "react";
import type { CommunityFeedPost } from "@/lib/api-data";
import { Avatar } from "@/components/ui/Avatar";

type Identity = {
  name: string;
  handle?: string;
  avatar?: string;
};

type Props = {
  post: CommunityFeedPost | null;
  onClose: () => void;
  currentUser?: Identity | null;
};

export function PostDetailDialog({ post, onClose }: Props) {
  useEffect(() => {
    if (!post) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [post]);

  const metaLine = useMemo(() => {
    if (!post) return "";
    return [post.channel, post.location, post.route, post.mood]
      .filter(Boolean)
      .join(" / ");
  }, [post]);

  if (!post) return null;

  const hasImage = Boolean(post.image);
  const hasText = Boolean(post.excerpt.trim());

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close post detail"
        className="absolute inset-0 bg-[var(--night)]/42 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper-deep)] bg-grain shadow-[0_36px_100px_rgba(17,25,35,0.22)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              Field Record
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{metaLine}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-xl text-[var(--muted)] transition hover:text-[var(--cinnabar)]"
            aria-label="Close post detail"
          >
            x
          </button>
        </div>

        <div className="scrollbar-hide grid flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_22rem]">
          <div className="px-5 py-5 sm:px-8 sm:py-7">
            {hasImage ? (
              <div className="overflow-hidden rounded-[1.5rem] border-[10px] border-white bg-white scrapbook-shadow">
                <img
                  src={post.image}
                  alt={post.title}
                  className={`w-full object-cover ${
                    hasText ? "max-h-[28rem]" : "max-h-[34rem]"
                  }`}
                />
              </div>
            ) : null}

            <div className={hasImage ? "mt-6" : ""}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                {hasImage && hasText
                  ? "Illustrated note"
                  : hasImage
                    ? "Photo signal"
                    : "Text dispatch"}
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl leading-[1] text-[var(--river-deep)] sm:text-5xl">
                {post.title}
              </h2>
              {hasText ? (
                <p className="mt-5 max-w-3xl text-[16px] leading-8 text-[var(--river-deep)]/82 handwritten sm:text-[18px]">
                  {post.excerpt}
                </p>
              ) : (
                <p className="mt-4 text-sm italic text-[var(--muted)]">
                  Shared as a visual-only field signal.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--river-deep)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/45 px-5 py-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Community replies are being rebuilt
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                We have disabled the old local-only comment box so notes are no
                longer lost when the dialog closes. A persistent reply desk can
                return once the backend comment model is ready.
              </p>
            </div>
          </div>

          <aside className="border-t border-[var(--line)] bg-white/45 px-5 py-5 lg:border-l lg:border-t-0">
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  Filed by
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar
                    src={post.user.avatar}
                    name={post.user.name}
                    seed={post.user.handle ?? post.user.name}
                    size={48}
                    ringClassName="border border-white/60 ring-2 ring-[var(--paper-deep)]"
                  />
                  <div>
                    <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                      {post.user.name}
                    </p>
                    {post.user.handle ? (
                      <p className="text-sm text-[var(--muted)]">
                        {post.user.handle}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Prompt trail
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--river-deep)]/82">
                  {post.prompt}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Likes
                  </p>
                  <p className="mt-1 text-2xl font-[family:var(--font-display)] text-[var(--river-deep)]">
                    {post.likes}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Saved
                  </p>
                  <p className="mt-1 text-2xl font-[family:var(--font-display)] text-[var(--river-deep)]">
                    {post.saves}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
