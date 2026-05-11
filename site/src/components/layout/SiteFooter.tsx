"use client";

import Link from "next/link";
import { siteNavigation } from "@/data/navigation";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/lib/locale-context";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[var(--night)] text-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.3fr_0.8fr_1fr]">
        <div className="space-y-4">
          <p className="font-[family:var(--font-display)] text-3xl">LingTour Guangdong</p>
          <p className="max-w-md text-sm leading-7 text-white/68">
            {t("common.site.tagline")}
          </p>
        </div>

        <div>
          <p className="mb-4 text-label text-white/48">{t("common.nav.routes")}</p>
          <div className="space-y-2 text-sm text-white/72">
            {siteNavigation.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="block transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm text-white/68">
          <p className="text-label text-white/48">{t("common.nav.about")}</p>
          <p>hello@lingtour.cn</p>
          <p>Guangzhou / Shantou / Meizhou</p>
          <p>{t("common.site.footer.rights")}</p>
        </div>
      </Container>
    </footer>
  );
}
