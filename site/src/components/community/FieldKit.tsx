"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { AUTH_PROMPTS } from "@/lib/auth-prompts";
import { apiClient, ApiRequestError } from "@/lib/api-client";

type FieldKitProps<TChannel extends string> = {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onPublish: (draft: {
    title: string;
    note: string;
    channel: TChannel;
    image?: string;
  }) => void | Promise<void>;
  initialBrief?: {
    title: string;
    channel: TChannel;
    prompt: string;
  };
  initialDraft?: {
    title?: string;
    note?: string;
    channel?: TChannel;
    image?: string;
  };
  channels: readonly ["All", ...TChannel[]];
  compact?: boolean;
};

export function FieldKit<TChannel extends string>({
  isOpen,
  onClose,
  isLoggedIn = false,
  onRequireLogin,
  onPublish,
  initialBrief,
  initialDraft,
  channels,
  compact = false,
}: FieldKitProps<TChannel>) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [activeChannel, setActiveChannel] = useState<TChannel>(channels[1]);
  const [image, setImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = !isLoggedIn;

  useEffect(() => {
    if (initialBrief) {
      setActiveChannel(initialBrief.channel);
    }
  }, [initialBrief]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialBrief?.channel) {
      setActiveChannel(initialBrief.channel);
    }
    if (initialDraft?.channel && channels.includes(initialDraft.channel)) {
      setActiveChannel(initialDraft.channel);
    }
    setTitle(initialDraft?.title ?? "");
    setNote(initialDraft?.note ?? "");
    setImage(initialDraft?.image ?? null);
    setError(null);
    setSubmitting(false);
  }, [channels, initialBrief, initialDraft, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) {
      const message = AUTH_PROMPTS.connectGoogleToUpload;
      setError(message);
      onRequireLogin?.();
      event.currentTarget.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setImageUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiClient<{ url: string }>("/public/community/upload", {
        method: "POST",
        body: formData,
      });
      setImage(data.url);
    } catch (uploadError) {
      if (uploadError instanceof ApiRequestError && uploadError.statusCode === 401) {
        setError(AUTH_PROMPTS.connectGoogleToUpload);
        onRequireLogin?.();
        setImage(null);
        return;
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed. Please try again.",
      );
      setImage(null);
    } finally {
      setImageUploading(false);
    }
  };

  const canPublish = Boolean(
    !locked && (title.trim() || note.trim() || image) && !imageUploading,
  );

  const handlePublish = async () => {
    if (!canPublish || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onPublish({
        title,
        note,
        channel: activeChannel,
        image: image || undefined,
      });
      setTitle("");
      setNote("");
      setImage(null);
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Could not dispatch this post right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[var(--night)]/50 backdrop-blur-[2px]"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <Reveal delay={0}>
        <div
          className={`relative w-full overflow-hidden journal-paper scrapbook-shadow ${
            compact ? "max-w-2xl" : "max-w-[42rem]"
          }`}
          style={{
            borderRadius: compact ? "24px" : "12px 44px 18px 36px",
            maxHeight: compact ? "min(80vh, 740px)" : "min(84vh, 820px)",
          }}
        >
          {!compact ? (
            <div className="pointer-events-none absolute bottom-0 left-6 top-0 flex w-8 flex-col justify-around py-8 opacity-20">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-3 w-8 rounded-full border-2 border-[var(--river-deep)]"
                />
              ))}
            </div>
          ) : null}

          <div
            className={`scrollbar-hide overflow-y-auto ${
              compact
                ? "max-h-[80vh] p-6 sm:p-7"
                : "max-h-[84vh] p-8 pl-16 sm:p-10 sm:pl-20"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b-2 border-[var(--line)] ${
                compact ? "mb-5 pb-4" : "mb-8 pb-6"
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                  Dispatch Mission
                </p>
                <h2
                  className={`font-[family:var(--font-display)] text-[var(--river-deep)] ${
                    compact ? "text-2xl" : "text-3xl"
                  }`}
                >
                  Field Note Kit
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-xl text-[var(--muted)] transition-colors hover:text-[var(--cinnabar)] disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {locked ? (
              <div className="mb-6 rounded-2xl border border-[var(--cinnabar)]/25 bg-[var(--cinnabar)]/8 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cinnabar)]">
                  {AUTH_PROMPTS.connectGoogleToUpload}
                </p>
              </div>
            ) : null}

            {initialBrief ? (
              <div
                className={`border border-[var(--gold)]/20 bg-[var(--gold)]/10 ${
                  compact ? "mb-5 rounded-2xl p-4" : "mb-8 rounded-xl p-5 rotate-[-1deg]"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  Active Brief
                </p>
                <p
                  className={`mt-1 font-[family:var(--font-display)] text-[var(--river-deep)] ${
                    compact ? "text-lg" : "text-xl"
                  }`}
                >
                  {initialBrief.title}
                </p>
                <p className="mt-2 text-sm italic leading-relaxed text-[var(--muted)]">
                  &ldquo;{initialBrief.prompt}&rdquo;
                </p>
              </div>
            ) : null}

            <div className={compact ? "grid gap-5" : "space-y-8"}>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {channels
                    .filter((channel): channel is TChannel => channel !== "All")
                    .map((channel) => (
                  <button
                        disabled={locked}
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          locked
                            ? "cursor-not-allowed bg-white/30 text-[var(--muted)] opacity-50"
                            : activeChannel === channel
                            ? "scale-105 bg-[var(--river-deep)] text-white shadow-md"
                            : "bg-white/50 text-[var(--muted)] hover:bg-white"
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Signal Title
                </label>
                <input
                  type="text"
                  value={title}
                  disabled={locked}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Optional title for text or image dispatch..."
                  className={`w-full border-b-2 border-[var(--line)] bg-transparent py-2 font-[family:var(--font-display)] outline-none transition-colors focus:border-[var(--gold)] placeholder:opacity-30 ${
                    locked ? "cursor-not-allowed opacity-50" : ""
                  } ${compact ? "text-xl" : "text-2xl"}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Observation Detail
                </label>
                <textarea
                  rows={compact ? 4 : 5}
                  value={note}
                  disabled={locked}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Write a field note, or leave this blank for a pure photo signal..."
                  className={`w-full resize-none rounded-xl border-2 border-dashed border-[var(--line)] bg-transparent p-4 leading-relaxed outline-none transition-colors focus:border-[var(--gold)] placeholder:opacity-30 handwritten ${
                    locked ? "cursor-not-allowed opacity-50" : ""
                  } ${compact ? "text-base" : "text-lg"}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Visual Signal (Optional)
                </label>
                <div className="flex gap-4">
                  <label
                    className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--line)] bg-white/30 backdrop-blur-sm transition-colors ${
                      locked
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-[var(--gold)]"
                    } ${compact ? "h-24 w-24" : "h-32 w-32"}`}
                  >
                    {image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${image})` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="text-[10px] font-bold uppercase text-white">
                            Change
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl text-[var(--muted)] group-hover:text-[var(--gold)]">
                          +
                        </span>
                        <span className="mt-2 text-[10px] font-bold uppercase text-[var(--muted)] group-hover:text-[var(--gold)]">
                          Add Photo
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={locked}
                      onChange={handleImageUpload}
                    />
                  </label>
                  {image ? (
                    <button
                      onClick={() => setImage(null)}
                      className="h-8 self-end rounded-full border border-[var(--line)] px-3 text-[10px] font-bold uppercase text-[var(--muted)] transition-all hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-[var(--cinnabar)]/25 bg-[var(--cinnabar)]/8 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cinnabar)]">
                    {error}
                  </p>
                </div>
              ) : null}

              <div className={compact ? "pt-2" : "pt-6"}>
                <button
                  onClick={handlePublish}
                  disabled={locked || !canPublish || submitting}
                  className={`w-full rounded-full bg-[var(--night)] font-bold tracking-widest text-white shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-[var(--night)] ${
                    compact ? "py-4 text-base" : "py-5 text-lg"
                  } hover:bg-[var(--cinnabar)]`}
                >
                  {submitting ? "DISPATCHING..." : imageUploading ? "UPLOADING IMAGE..." : "STAMP & DISPATCH"}
                </button>
                <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Publish as illustrated note, text-only note, or photo-only signal
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
