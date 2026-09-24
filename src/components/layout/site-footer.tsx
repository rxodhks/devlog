import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="container flex flex-col items-start justify-between gap-3 py-10 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.author.name}
        </p>
        <p className="font-mono text-xs">
          Built with Next.js · MDX · Tailwind CSS · framer-motion
        </p>
      </div>
    </footer>
  );
}
