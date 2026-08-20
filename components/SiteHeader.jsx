"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="НМТ — на головну">
        <span className="brand-mark" aria-hidden="true">
          ∑
        </span>
        <span>НМТ</span>
      </Link>
      <nav className="site-nav" aria-label="Основна навігація">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
          Повний тест
        </Link>
        <Link href="/practice" aria-current={pathname === "/practice" ? "page" : undefined}>
          Практика
        </Link>
      </nav>
    </header>
  );
}
