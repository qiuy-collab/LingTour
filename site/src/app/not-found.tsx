import Link from "next/link";
import { cookies } from "next/headers";
import { translate } from "@/translations";
import type { Locale } from "@/lib/locale";

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
export default async function NotFound() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("lingtour-locale")?.value;
  const locale: Locale = localeCookie === "zh" ? "zh" : "en";
  const t = (key: string) => translate(key, locale);

  return (
    <main className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      <section className="site-container flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--cinnabar)]">
          {t("notFound.badge")}
        </p>
        <h1 className="mt-8 font-[family:var(--font-display)] text-6xl leading-[0.9] tracking-[-0.03em] md:text-8xl lg:text-9xl">
          {t("notFound.title")} <br />
          <span className="italic text-[var(--gold)]">{t("notFound.titleAccent")}</span>
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-[var(--muted)] handwritten">
          {t("notFound.description")}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            {t("notFound.btn.home")}
          </Link>
          <Link
            href="/culture"
            className="btn-paper inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            {t("notFound.btn.cities")}
          </Link>
          <Link
            href="/routes"
            className="btn-paper inline-flex items-center justify-center px-10 py-5 text-xs"
          >
            {t("notFound.btn.routes")}
          </Link>
        </div>
      </section>
    </main>
  );
}
