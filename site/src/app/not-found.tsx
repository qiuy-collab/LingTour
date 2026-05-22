import Link from "next/link";

/**
 * App-level 404 page (App Router convention: app/not-found.tsx).
 *
 * Triggered by `notFound()` in any client/server component when the page's
 * resource doesn't exist (e.g. a city/route/product slug that returned 404
 * from the backend). Visiting an unknown URL also lands here.
 *
 * Visual style follows the rest of the site: archive paper, handwritten
 * notes, no demo language.
 */
export default function NotFound() {
  return (
    <main className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      <section className="site-container flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--cinnabar)]">
          ✦ Field Archive · Status 404
        </p>
        <h1 className="mt-8 font-[family:var(--font-display)] text-6xl leading-[0.9] tracking-[-0.03em] md:text-8xl lg:text-9xl">
          This page is <br />
          <span className="italic text-[var(--gold)]">not on file.</span>
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-[var(--muted)] handwritten">
          The route, city, or object you were looking for hasn&apos;t been
          published — or the URL has changed since it was filed. Try one of
          the doors below.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            Back to home
          </Link>
          <Link
            href="/culture"
            className="btn-paper inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            Browse cities
          </Link>
          <Link
            href="/routes"
            className="btn-paper inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            Browse routes
          </Link>
        </div>
      </section>
    </main>
  );
}
