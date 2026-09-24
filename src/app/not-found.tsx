import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <p className="font-mono text-sm text-primary">HTTP/1.1 404 Not Found</p>
      <h1 className="text-4xl font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="max-w-md text-muted">요청한 경로에 해당하는 글이 없거나 이동되었습니다.</p>
      <Button asChild variant="primary">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
