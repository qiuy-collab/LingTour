import Link from "next/link";
import { LoginPanel } from "@/components/account/LoginPanel";

const loginSteps = [
  ["01", "Enter email", "Use the demo account or your own email to create a local travel profile."],
  ["02", "Save interests", "Choose the kind of Guangdong trip you want to keep planning."],
  ["03", "Open account", "After submitting, LingTour takes you straight to the personal center."],
];

export default function LoginPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[var(--night)] text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-34"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.98),rgba(17,25,35,0.78)_52%,rgba(17,25,35,0.42))]" />

        <div className="site-container relative z-10 grid min-h-[calc(100vh-73px)] gap-10 py-10 lg:grid-cols-[0.82fr_0.58fr] lg:items-center lg:py-20">
          <div className="order-2 max-w-3xl lg:order-1">
            <p className="text-label text-white/54">Account access</p>
            <h1 className="mt-5 max-w-[13ch] font-[family:var(--font-display)] text-5xl leading-[1.04] md:text-6xl">
              Keep your Guangdong plans in one place.
            </h1>
            <p className="mt-7 max-w-xl border-l border-white/18 pl-6 text-base leading-8 text-white/70">
              Sign in to collect routes, review saved objects, and return to interpreting drafts
              without rebuilding the trip from memory.
            </p>
            <div className="mt-9 grid gap-px overflow-hidden border border-white/12 bg-white/12 md:max-w-2xl md:grid-cols-3">
              {loginSteps.map(([label, title, body]) => (
                <div key={label} className="bg-white/6 p-5 backdrop-blur">
                  <p className="font-[family:var(--font-display)] text-3xl text-[var(--cinnabar)]">{label}</p>
                  <h2 className="mt-5 text-sm font-semibold text-white">{title}</h2>
                  <p className="mt-3 text-xs leading-6 text-white/58">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <LoginPanel />
            <div className="mt-4 grid gap-px overflow-hidden border border-white/12 bg-white/12 text-sm sm:grid-cols-2">
              <Link href="/culture" className="bg-white/8 px-5 py-4 text-center text-white/76 transition hover:bg-white hover:text-[var(--night)]">
                Continue browsing
              </Link>
              <Link href="/account" className="bg-white/8 px-5 py-4 text-center text-white/76 transition hover:bg-white hover:text-[var(--night)]">
                View account center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
