"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";

type FieldKitProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (draft: { title: string; note: string; channel: any; image?: string }) => void;
  initialBrief?: {
    title: string;
    channel: string;
    prompt: string;
  };
  channels: readonly string[];
};

export function FieldKit({ isOpen, onClose, onPublish, initialBrief, channels }: FieldKitProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [activeChannel, setActiveChannel] = useState(channels[1]); // Default to first non-"All"
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialBrief) {
      setActiveChannel(initialBrief.channel);
    }
  }, [initialBrief]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    onPublish({ title, note, channel: activeChannel, image: image || undefined });
    setTitle("");
    setNote("");
    setImage(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[var(--night)]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <Reveal delay={0}>
        <div
          className="relative w-full max-w-2xl overflow-hidden journal-paper scrapbook-shadow"
          style={{ borderRadius: "10px 60px 20px 50px" }}
        >
          {/* Notebook Spiral Decoration */}
          <div className="absolute left-6 top-0 bottom-0 w-8 flex flex-col justify-around py-8 pointer-events-none opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-3 w-8 border-2 border-[var(--river-deep)] rounded-full" />
            ))}
          </div>

          <div className="p-10 pl-20 sm:p-12 sm:pl-24">
            <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-6 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">Dispatch Mission</p>
                <h2 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">Field Note Kit</h2>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--cinnabar)] transition-colors"
              >
                ✕
              </button>
            </div>

            {initialBrief && (
              <div className="mb-8 p-5 bg-[var(--gold)]/10 rounded-xl border border-[var(--gold)]/20 rotate-[-1deg]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Active Brief</p>
                <p className="mt-1 font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">{initialBrief.title}</p>
                <p className="mt-2 text-sm italic text-[var(--muted)] leading-relaxed">"{initialBrief.prompt}"</p>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {channels.filter(c => c !== "All").map(channel => (
                    <button
                      key={channel}
                      onClick={() => setActiveChannel(channel)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeChannel === channel
                        ? "bg-[var(--river-deep)] text-white scale-105 shadow-md"
                        : "bg-white/50 text-[var(--muted)] hover:bg-white"
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">Signal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The sound of morning tide..."
                  className="w-full bg-transparent border-b-2 border-[var(--line)] py-2 font-[family:var(--font-display)] text-2xl outline-none focus:border-[var(--gold)] transition-colors placeholder:opacity-30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">Observation Detail</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record what others might miss..."
                  className="w-full bg-transparent border-2 border-dashed border-[var(--line)] p-4 rounded-xl text-lg leading-relaxed outline-none focus:border-[var(--gold)] transition-colors placeholder:opacity-30 resize-none handwritten"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">Visual Signal (Optional)</label>
                <div className="flex gap-4">
                  <label className="relative flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-[var(--line)] hover:border-[var(--gold)] transition-colors cursor-pointer group overflow-hidden bg-white/30 backdrop-blur-sm">
                    {image ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold uppercase">Change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl text-[var(--muted)] group-hover:text-[var(--gold)]">📸</span>
                        <span className="mt-2 text-[10px] font-bold uppercase text-[var(--muted)] group-hover:text-[var(--gold)]">Add Photo</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {image && (
                    <button
                      onClick={() => setImage(null)}
                      className="h-8 px-3 rounded-full border border-[var(--line)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--cinnabar)] hover:border-[var(--cinnabar)] transition-all self-end"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handlePublish}
                  disabled={!title || !note}
                  className="w-full py-5 rounded-full bg-[var(--night)] text-white font-bold text-lg tracking-widest hover:bg-[var(--cinnabar)] disabled:opacity-30 disabled:hover:bg-[var(--night)] transition-all transform active:scale-95 shadow-2xl"
                >
                  STAMP & DISPATCH
                </button>
                <p className="text-center mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Your signal will be added to the live intelligence feed
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
