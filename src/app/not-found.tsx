import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="section-label">404</p>
      <h1 className="mt-8 font-serif text-display-2 font-light text-ink">
        이 페이지는 아직
        <br />
        쓰이지 않았어요.
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-muted">주소가 바뀌었거나, 아직 적지 않은 글일지도 몰라요.</p>
      <div className="mt-10 flex gap-8 text-[0.95rem]">
        <Link href="/" className="ink-link text-ink">
          처음으로 돌아가기
        </Link>
        <Link href="/posts" className="ink-link text-muted hover:text-ink">
          모든 글 보기
        </Link>
      </div>
    </div>
  );
}
