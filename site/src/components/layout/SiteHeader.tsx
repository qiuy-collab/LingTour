"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteNavigation } from "@/data/navigation";
import { AccountNavLink } from "@/components/layout/AccountNavLink";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { RoutesMegaMenu } from "@/components/layout/RoutesMegaMenu";
import { Container } from "@/components/ui/Container";
import { useUI } from "@/lib/ui-context";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { toggleDrawer } = useUI();
  const leftNavigation = siteNavigation.filter((item) =>
    ["/", "/culture", "/routes", "/interpreting"].includes(item.href),
  );
  const rightNavigation = siteNavigation.filter((item) => ["/shop", "/community"].includes(item.href));

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[var(--paper-deep)] bg-grain backdrop-blur-xl">
      <Container className="grid grid-cols-[1fr_auto] items-center gap-5 py-4 md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden items-center justify-start gap-1 md:flex" aria-label="Primary navigation">
          {leftNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);

            if (item.href === "/routes") {
              return <RoutesMegaMenu key={item.href} active={active} />;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-3 text-sm transition ${
                  active
                    ? "text-[var(--cinnabar)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="justify-self-start leading-none md:justify-self-center" onClick={() => setIsOpen(false)}>
          <p className="font-[family:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--river-deep)]">
            LingTour
          </p>
          <p className="mt-1 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">
            Guangdong
          </p>
        </Link>

        <div className="hidden items-center justify-end gap-1 md:flex">
          <LanguageToggle />
          <nav className="flex items-center gap-1" aria-label="Secondary navigation">
            {rightNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-3 text-sm transition ${
                    active
                      ? "text-[var(--cinnabar)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <AccountNavLink />
          <Link
            href="/interpreting#booking"
            className="btn-primary-compact ml-1 inline-flex items-center justify-center px-4 py-2.5 text-sm"
          >
            Reserve
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center border border-[var(--line)] bg-white/60 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="grid gap-1.5">
            <span className={`h-px w-5 bg-[var(--ink)] transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-[var(--ink)] transition ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-5 bg-[var(--ink)] transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </Container>

      {isOpen ? (
        <div className="max-h-[calc(100svh-4.6rem)] overflow-y-auto border-t border-[var(--line)] bg-[var(--paper-deep)] bg-grain md:hidden">
          <Container className="grid gap-2 py-4">
            {siteNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[var(--river-deep)] text-white shadow-lg"
                      : "border border-[var(--line)] bg-white/40 text-[var(--ink)]"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 [&>a]:ml-0 [&>a]:justify-center [&>button]:justify-center [&>button]:border [&>button]:border-[var(--line)] [&>button]:bg-white/40 [&>button]:py-3">
              <AccountNavLink onNavigate={() => setIsOpen(false)} />
              <LanguageToggle />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/interpreting#booking"
                className="btn-primary-compact inline-flex items-center justify-center px-4 py-3 text-center text-sm"
                onClick={() => setIsOpen(false)}
              >
                Reserve
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
