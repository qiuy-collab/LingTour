"use client";

type DispatchCardProps = {
  stampCount: number;
  onDispatch: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
};

export function DispatchCard({ stampCount, onDispatch, isLoggedIn, onLogin }: DispatchCardProps) {
  return (
    <div className="group w-full bg-[var(--night)] p-6 sm:p-8 scrapbook-shadow text-white rotate-1 transition-transform hover:rotate-0">
      <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
          Field Dispatch
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[var(--gold)] text-[var(--gold)]">
            <span className="text-[10px] font-bold">{stampCount}</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-white/70">Stamps</span>
        </div>
      </div>

      <h3 className="font-[family:var(--font-display)] text-3xl italic text-white">
        Share a Signal
      </h3>

      <p className="mt-4 text-sm leading-relaxed text-white/70 handwritten">
        Field work is about the unseen. Capture a detail, trade intelligence, and earn field stamps.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {isLoggedIn ? (
          <button
            onClick={onDispatch}
            className="w-full rounded-full bg-white py-4 text-sm font-bold text-[var(--night)] transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Open Field Kit
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="w-full rounded-full bg-[var(--cinnabar)] py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Sign in to Publish
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">
          LingTour Archival Desk
        </p>
      </div>
    </div>
  );
}
