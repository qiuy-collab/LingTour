"use client";

import { useEffect, useState } from "react";
import type { CommunityFeedPost } from "@/lib/api-data";
import {
  toggleCommunityPostLike,
  toggleCommunityPostSave,
} from "@/lib/api-data";
import { Avatar } from "@/components/ui/Avatar";

type PostCardProps = {
  post: CommunityFeedPost;
  variant?: "image" | "feature" | "text";
  onOpen?: (post: CommunityFeedPost) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onEngagementChange?: (post: CommunityFeedPost) => void;
};

export function PostCard({
  post,
  variant = "image",
  onOpen,
  isLoggedIn = false,
  onRequireLogin,
  onEngagementChange,
}: PostCardProps) {
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [saved, setSaved] = useState(Boolean(post.saved));
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saveCount, setSaveCount] = useState(post.saves);
  const hasImage = Boolean(post.image);
  const hasText = Boolean(post.excerpt.trim());

  useEffect(() => {
    setLiked(Boolean(post.liked));
    setSaved(Boolean(post.saved));
    setLikeCount(post.likes);
    setSaveCount(post.saves);
  }, [post.id, post.liked, post.likes, post.saved, post.saves]);

  const publishEngagement = (changes: Partial<CommunityFeedPost>) => {
    onEngagementChange?.({
      ...post,
      liked,
      saved,
      likes: likeCount,
      saves: saveCount,
      ...changes,
    });
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      onRequireLogin?.();
      return;
    }
    const nextLiked = !liked;
    const optimisticLikes = Math.max(0, likeCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikeCount(optimisticLikes);
    publishEngagement({ liked: nextLiked, likes: optimisticLikes });
    try {
      const result = await toggleCommunityPostLike(post.id);
      setLiked(result.liked);
      setLikeCount(result.likes);
      publishEngagement({ liked: result.liked, likes: result.likes });
    } catch (error) {
      setLiked(liked);
      setLikeCount(likeCount);
      publishEngagement({ liked, likes: likeCount });
      console.error("Failed to toggle community post like", error);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      onRequireLogin?.();
      return;
    }
    const nextSaved = !saved;
    const optimisticSaves = Math.max(0, saveCount + (nextSaved ? 1 : -1));
    setSaved(nextSaved);
    setSaveCount(optimisticSaves);
    publishEngagement({ saved: nextSaved, saves: optimisticSaves });
    try {
      const result = await toggleCommunityPostSave(post.id);
      setSaved(result.saved);
      setSaveCount(result.saves);
      publishEngagement({ saved: result.saved, saves: result.saves });
    } catch (error) {
      setSaved(saved);
      setSaveCount(saveCount);
      publishEngagement({ saved, saves: saveCount });
      console.error("Failed to toggle community post save", error);
    }
  };

  return (
    <article className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_16px_52px_rgba(17,25,35,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_76px_rgba(17,25,35,0.13)]">
      <button type="button" onClick={() => onOpen?.(post)} className="block w-full text-left">
        {hasImage ? (
          <div className={`relative overflow-hidden ${variant === "feature" ? "aspect-[5/4]" : "aspect-[4/3]"}`}>
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.045]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(7,16,22,0.66))]" />
            <span className="absolute left-4 top-4 rounded-full border border-white/28 bg-black/26 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              {post.channel}
            </span>
            {variant === "feature" ? (
              <h2 className="absolute inset-x-0 bottom-0 p-5 font-[family:var(--font-display)] text-3xl leading-[0.95] text-white">
                {post.title}
              </h2>
            ) : null}
          </div>
        ) : (
          <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,var(--river-deep),var(--night))] p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Text signal</span>
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/44">{post.channel}</span>
            </div>
            <p className="mt-8 max-w-[17rem] font-[family:var(--font-display)] text-2xl leading-[1.05]">Filed without an image, kept for the detail.</p>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.user.avatar}
              name={post.user.name}
              seed={post.user.handle ?? post.user.name}
              size={32}
              ringClassName="border border-white/50 ring-2 ring-[var(--paper-deep)]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--river-deep)]">{post.user.name}</p>
              <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-[var(--muted)]">{post.user.handle}</p>
            </div>
          </div>

          {variant !== "feature" ? (
            <h2 className="mt-5 font-[family:var(--font-display)] text-3xl leading-[0.98] tracking-[-0.035em] text-[var(--river-deep)]">
              {post.title}
            </h2>
          ) : null}
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
            {hasText ? post.excerpt : "Photo-only signal. Open it to read the full field context."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {post.route ? <span className="rounded-full bg-[var(--paper)] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--cinnabar)]">#{post.route}</span> : null}
            {post.location ? <span className="rounded-full bg-[var(--paper)] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">@{post.location}</span> : null}
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={liked}
          className={`inline-flex min-h-10 items-center rounded-full px-3 font-mono text-[8px] font-bold uppercase tracking-[0.16em] transition ${
            !isLoggedIn
              ? "text-[var(--muted)] opacity-55"
              : liked
                ? "bg-[var(--cinnabar)]/10 text-[var(--cinnabar)]"
                : "text-[var(--muted)] hover:text-[var(--cinnabar)]"
          }`}
        >
          Like · {likeCount}
        </button>
        <button
          type="button"
          onClick={handleSave}
          aria-pressed={saved}
          className={`inline-flex min-h-10 items-center rounded-full px-3 font-mono text-[8px] font-bold uppercase tracking-[0.16em] transition ${
            !isLoggedIn
              ? "text-[var(--muted)] opacity-55"
              : saved
                ? "bg-[var(--gold)]/12 text-[var(--gold)]"
                : "text-[var(--muted)] hover:text-[var(--gold)]"
          }`}
        >
          Save · {saveCount}
        </button>
      </div>
    </article>
  );
}
