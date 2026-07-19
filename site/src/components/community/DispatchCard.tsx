"use client";

type DispatchCardProps = {
  stampCount: number;
  onDispatch: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
};

export function DispatchCard({ stampCount, onDispatch, isLoggedIn, onLogin }: DispatchCardProps) {
  return (
    <div className="group w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--night)] p-6 text-white shadow-[0_22px_70px_rgba(17,25,35,0.2)] sm:p-7">
      <div className="flex items-center justify-between gap-5 border-b border-white/12 pb-5">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">Field dispatch</p>
        <div className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5">
          <span className="font-[family:var(--font-display)] text-lg text-[var(--gold)]">{stampCount}</span>
          <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-white/42">Stamps</span>
        </div>
      </div>
      <h3 className="mt-7 font-[family:var(--font-display)] text-4xl leading-[0.92]">Share a signal.</h3>
      <p className="mt-5 text-sm leading-7 text-white/60">Capture a useful detail, trade field intelligence, and keep the route open for the next traveller.</p>
      <button
        type="button"
        onClick={isLoggedIn ? onDispatch : onLogin}
        className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 font-mono text-[9px] font-bold uppercase tracking-[0.18em] transition active:scale-[0.98] ${
          isLoggedIn
            ? "bg-[var(--gold)] text-[var(--night)] hover:bg-white"
            : "bg-[var(--cinnabar)] text-white hover:bg-white hover:text-[var(--night)]"
        }`}
      >
        {isLoggedIn ? "Open field kit" : "Sign in to publish"}
      </button>
      <p className="mt-5 text-center font-mono text-[7px] uppercase tracking-[0.18em] text-white/28">LingTour signal desk</p>
    </div>
  );
}
