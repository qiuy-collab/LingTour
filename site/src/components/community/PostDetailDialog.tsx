"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommunityFeedPost } from "@/lib/api-data";

type Identity = {
  name: string;
  handle?: string;
  avatar?: string;
};

type ReplyItem = {
  id: string;
  author: Identity;
  body: string;
};

type CommentItem = {
  id: string;
  author: Identity;
  body: string;
  likes: number;
  liked: boolean;
  replies: ReplyItem[];
};

type Props = {
  post: CommunityFeedPost | null;
  onClose: () => void;
  currentUser?: Identity | null;
};

const FALLBACK_AVATAR = "/uploads/seed/zhanjiang-hero-1200.jpg";

function avatarOf(value?: string) {
  return value || FALLBACK_AVATAR;
}

export function PostDetailDialog({ post, onClose, currentUser }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!post) return;
    setComments([]);
    setCommentDraft("");
    setReplyDrafts({});
    setReplyingTo(null);
  }, [post]);

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

  const activeIdentity: Identity = currentUser
    ? {
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      }
    : {
        name: "You",
        handle: "@you",
        avatar: FALLBACK_AVATAR,
      };

  const addComment = () => {
    const clean = commentDraft.trim();
    if (!clean) return;
    setComments((items) => [
      {
        id: `${post.id}-new-${Date.now()}`,
        author: activeIdentity,
        body: clean,
        likes: 0,
        liked: false,
        replies: [],
      },
      ...items,
    ]);
    setCommentDraft("");
  };

  const addReply = (commentId: string) => {
    const clean = replyDrafts[commentId]?.trim();
    if (!clean) return;
    setComments((items) =>
      items.map((item) =>
        item.id === commentId
          ? {
              ...item,
              replies: [
                ...item.replies,
                {
                  id: `${commentId}-reply-${Date.now()}`,
                  author: activeIdentity,
                  body: clean,
                },
              ],
            }
          : item,
      ),
    );
    setReplyDrafts((drafts) => ({ ...drafts, [commentId]: "" }));
    setReplyingTo(null);
  };

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
          >
            ×
          </button>
        </div>

        <div className="scrollbar-hide grid flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_22rem]">
          <div className="px-5 py-5 sm:px-8 sm:py-7">
            {hasImage ? (
              <div className="overflow-hidden rounded-[1.5rem] border-[10px] border-white bg-white scrapbook-shadow">
                <img
                  src={post.image}
                  alt={post.title}
                  className={`w-full object-cover ${hasText ? "max-h-[28rem]" : "max-h-[34rem]"}`}
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

            <div className="mt-8 border-t border-[var(--line)] pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                    Comment desk
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Add route context, ask follow-ups, or leave a field reply.
                  </p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {comments.length} comments
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Leave a useful comment..."
                  rows={2}
                  className="min-h-[88px] flex-1 resize-none rounded-[1.25rem] border border-[var(--line)] bg-white/75 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--cinnabar)]"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className="self-end rounded-full bg-[var(--river-deep)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--cinnabar)]"
                >
                  Comment
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {comments.length ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-[1.25rem] border border-[var(--line)] bg-white/65 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 shrink-0 rounded-full border border-white/60 bg-cover bg-center ring-2 ring-[var(--paper-deep)]"
                          style={{ backgroundImage: `url(${avatarOf(comment.author.avatar)})` }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cinnabar)]">
                              {comment.author.name}
                            </p>
                            {comment.author.handle ? (
                              <span className="text-xs text-[var(--muted)]">
                                {comment.author.handle}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[var(--river-deep)]/84">
                            {comment.body}
                          </p>
                        </div>
                      </div>

                      {comment.replies.length ? (
                        <div className="mt-4 space-y-3 border-l-2 border-[var(--gold)]/45 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div
                                className="h-8 w-8 shrink-0 rounded-full border border-white/60 bg-cover bg-center"
                                style={{ backgroundImage: `url(${avatarOf(reply.author.avatar)})` }}
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-semibold text-[var(--river-deep)]">
                                    {reply.author.name}
                                  </p>
                                  {reply.author.handle ? (
                                    <span className="text-xs text-[var(--muted)]">
                                      {reply.author.handle}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                                  {reply.body}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setComments((items) =>
                              items.map((item) =>
                                item.id === comment.id
                                  ? {
                                      ...item,
                                      liked: !item.liked,
                                      likes: item.liked ? item.likes - 1 : item.likes + 1,
                                    }
                                  : item,
                              ),
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            comment.liked
                              ? "bg-[var(--cinnabar)] text-white"
                              : "border border-[var(--line)] text-[var(--river-deep)] hover:border-[var(--cinnabar)]"
                          }`}
                        >
                          {comment.likes} likes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo((current) =>
                              current === comment.id ? null : comment.id,
                            )
                          }
                          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--river-deep)] transition hover:border-[var(--gold)]"
                        >
                          Reply
                        </button>
                      </div>

                      {replyingTo === comment.id ? (
                        <div className="mt-4 flex gap-2">
                          <input
                            value={replyDrafts[comment.id] ?? ""}
                            onChange={(event) =>
                              setReplyDrafts((drafts) => ({
                                ...drafts,
                                [comment.id]: event.target.value,
                              }))
                            }
                            placeholder="Write a reply..."
                            className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm outline-none transition focus:border-[var(--gold)]"
                          />
                          <button
                            type="button"
                            onClick={() => addReply(comment.id)}
                            className="rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-[var(--night)] transition hover:bg-white"
                          >
                            Send
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white/45 px-5 py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                      No comments yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Start the discussion with a useful local detail, a follow-up
                      question, or a clarification for the next traveler.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="border-t border-[var(--line)] bg-white/45 px-5 py-5 lg:border-l lg:border-t-0">
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  Filed by
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full border border-white/60 bg-cover bg-center ring-2 ring-[var(--paper-deep)]"
                    style={{ backgroundImage: `url(${avatarOf(post.user.avatar)})` }}
                  />
                  <div>
                    <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                      {post.user.name}
                    </p>
                    {post.user.handle ? (
                      <p className="text-sm text-[var(--muted)]">{post.user.handle}</p>
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
                    Replies
                  </p>
                  <p className="mt-1 text-2xl font-[family:var(--font-display)] text-[var(--river-deep)]">
                    {post.comments}
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
