import Link from "next/link";

import { GithubIcon } from "@/components/layout/icons";
import { Wordmark } from "@/components/layout/wordmark";
import { siteConfig } from "@/lib/site";

/** 책의 판권면(colophon)처럼 조용히 끝나는 푸터 */
export function SiteFooter() {
  return (
    <footer className="mt-32">
      <div className="container">
        <div className="border-t border-rule py-12">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <Wordmark withTagline={false} />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{siteConfig.description}</p>
            </div>

            <div>
              <p className="meta mb-3">둘러보기</p>
              <ul className="space-y-1.5 text-sm">
                {siteConfig.nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="ink-link text-ink-soft hover:text-ink">
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={siteConfig.author.github} target="_blank" rel="noreferrer" className="ink-link inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
                    <GithubIcon className="size-3.5" /> GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="meta mb-3">판권</p>
              <p className="text-sm leading-relaxed text-muted">
                제목은 Noto Serif KR과 Newsreader, 본문은 Pretendard, 코드는 JetBrains Mono로 조판했습니다. 코드 색은
                Kanagawa 테마를 빌려 왔어요.
              </p>
            </div>
          </div>

          <p className="mt-12 font-serif text-sm italic text-muted">
            © {new Date().getFullYear()} {siteConfig.author.name}. 천천히, 그러나 꾸준히.
          </p>
        </div>
      </div>
    </footer>
  );
}
