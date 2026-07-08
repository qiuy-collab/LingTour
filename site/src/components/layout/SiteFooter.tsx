"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNavigation } from "@/data/navigation";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/lib/locale-context";

const FOOTER_NAV_LABEL_KEY: Record<string, string> = {
  "/culture": "common.nav.culture",
  "/routes": "common.nav.routes",
  "/interpreting": "common.nav.interpreting",
  "/shop": "common.nav.shop",
  "/community": "common.nav.community",
};

export function SiteFooter() {
  const { t } = useLocale();
  const pathname = usePathname();

  // The admin area renders its own chrome — don't show the marketing footer.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-[var(--river-deep)] bg-grain text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]/20" />
      <Container className="grid gap-16 py-20 lg:grid-cols-[1.5fr_1fr_1fr] relative z-10">
        <div className="space-y-8">
          <div>
            <p className="font-[family:var(--font-display)] text-4xl lg:text-5xl tracking-tight">LingTour</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">{t("common.footer.brand")}</p>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-white/50 handwritten">
            {t("common.site.tagline")}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{t("common.nav.routes")}</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium text-white/70">
            {siteNavigation.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[var(--gold)]">
                {t(FOOTER_NAV_LABEL_KEY[item.href] ?? "common.nav.routes")}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4 text-sm text-white/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{t("common.footer.registry")}</p>
            <p className="text-lg text-white">hello@lingtour.cn</p>
            <p className="handwritten text-white/70">{t("common.footer.locations")}</p>
          </div>
          <div className="pt-8 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/30">
            {t("common.site.footer.rights")}
          </div>
        </div>
      </Container>

      {/* Abstract decorative element */}
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
    </footer>
  );
}
