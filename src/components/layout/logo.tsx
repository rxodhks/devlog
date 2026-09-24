import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="TechLog 홈">
      <span className="relative grid size-8 place-items-center rounded-[10px] bg-brand-gradient font-mono text-[13px] font-bold text-white shadow-glow transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
        &gt;_
      </span>
      <span className="hidden whitespace-nowrap text-[17px] font-bold tracking-tight min-[400px]:inline">
        {siteConfig.name}
        <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-blink bg-primary" />
      </span>
    </Link>
  );
}
