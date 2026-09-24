# TechLog

CS · Database/SQL · Python · Computer Networking 지식을 기록하는 엔지니어링 테크 블로그입니다.

- **Next.js 15 (App Router) + TypeScript**, React 19
- **Tailwind CSS 3** (`tailwind.config.js`) + `clsx` / `tailwind-merge` + Radix UI (shadcn 패턴)
- **framer-motion** — 카드 hover glow, 페이지 전환, TOC `layoutId`, 테마 전환
- **MDX** (`next-mdx-remote/rsc`) + **shiki** (`rehype-pretty-code`) + **KaTeX** + **Mermaid**
- **react-force-graph-2d** — 인터랙티브 지식 그래프

## 시작하기

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Node.js 18.18 이상이 필요합니다(20 LTS 이상 권장). 폰트(Pretendard, Inter, JetBrains Mono)는 npm 패키지로 self-host 하므로 빌드 시 외부 네트워크가 필요 없습니다.

## 디렉터리 구조

```
techlog/
├─ content/posts/*.mdx           # 블로그 글 (frontmatter + MDX)
├─ tailwind.config.js            # 디자인 토큰, 폰트, typography(prose-techlog)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # 루트 레이아웃 + ThemeProvider + 폰트
│  │  ├─ template.tsx            # 페이지 전환 (Fade & Slide Up)
│  │  ├─ globals.css             # CSS 변수(라이트/다크), 코드블록·KaTeX·glow 스타일
│  │  ├─ page.tsx                # 홈: Bento Grid 대시보드
│  │  ├─ posts/page.tsx          # 글 목록 + 카테고리/태그/검색 필터
│  │  ├─ posts/[slug]/page.tsx   # 글 상세: 2단 레이아웃 + Sticky TOC
│  │  └─ graph/page.tsx          # 지식 그래프 전체 화면
│  ├─ components/
│  │  ├─ layout/                 # 헤더, 푸터, 테마 토글(원형 clip-path), 로고
│  │  ├─ home/                   # Bento 카드들 (hero, graph preview, roadmap, stats…)
│  │  ├─ post/                   # TOC(scroll-spy), 읽기 진행바, 사이드바, 난이도 태그
│  │  ├─ mdx/                    # CodeBlock, SqlResult, MathCalc, Mermaid, Callout
│  │  ├─ graph/                  # KnowledgeGraph (canvas) + GraphExplorer
│  │  ├─ posts/                  # PostExplorer (필터 UI)
│  │  └─ ui/                     # Button, Badge, Tabs, Popover, Dialog (Radix)
│  ├─ lib/
│  │  ├─ posts.ts                # MDX 파일 로딩, 태그/관련 글 계산
│  │  ├─ mdx.ts                  # remark/rehype 파이프라인
│  │  ├─ remark-mermaid.ts       # ```mermaid → <Mermaid /> 변환
│  │  ├─ toc.ts, reading-time.ts # 목차 추출, 한/영 혼합 읽기 시간
│  │  ├─ graph.ts                # 지식 그래프 노드/링크 생성
│  │  ├─ calculators.ts          # <MathCalc> 수식 계산기 레지스트리
│  │  ├─ study-data.ts           # 홈 학습 통계 목업 데이터
│  │  └─ site.ts                 # 사이트/작성자/카테고리 설정
│  └─ types/post.ts
```

## 글 쓰기

`content/posts/새-글.mdx` 파일을 만들면 목록, 지식 그래프, 관련 글에 자동으로 반영됩니다.

```mdx
---
title: "글 제목"
shortTitle: "그래프 노드용 짧은 제목"   # 선택
description: "한두 문장 요약"
date: "2026-09-23"
category: database          # cs | database | python | network
tags: ["SQL", "Index"]
difficulty: intermediate    # beginner | intermediate | advanced
featured: true              # 선택: 홈 카드 후보
series: "SQL Deep Dive"     # 선택
related: ["sql-window-functions"]  # 선택: 그래프에서 점선으로 연결
---
```

### 코드 블록

````mdx
```sql title="query.sql" {2-3}
SELECT *
FROM employees          -- 2~3번 줄 하이라이트
WHERE salary > 5000;
```

```python title="diff.py"
old_line()  # [!code --]
new_line()  # [!code ++]
```
````

- 언어 배지, 파일명, 줄 번호, 복사 버튼이 자동으로 붙습니다 (diff에서 삭제 줄은 복사에서 제외).
- `// [!code focus]` 로 특정 줄 포커스, `/word/` 로 단어 하이라이트도 지원합니다.

### SQL 실행 결과 탭

````mdx
<SqlResult
  columns={["dept", "avg_salary"]}
  rows={[["Engineering", 6933], ["Sales", 5000]]}
  highlight={[0]}
  engine="Oracle Database"
  time="0.004s"
>

```sql
SELECT dept, AVG(salary) FROM employees GROUP BY dept;
```

</SqlResult>
````

### 수식 (KaTeX) + 미니 계산기

```mdx
인라인 $O(N \log N)$, 블록은 $$ ... $$

<MathCalc id="nlogn" />          {/* 인라인, 클릭하면 계산기 팝오버 */}
<MathCalc id="mathis" block />   {/* 블록 형태 */}
```

계산기는 `src/lib/calculators.ts`에 등록합니다 (`nlogn`, `sort-lower-bound`, `mathis`, `bdp`, `generator-memory` 기본 제공).

### Mermaid 다이어그램

````mdx
```mermaid title="캡션"
erDiagram
    USERS ||--o{ ORDERS : places
```
````

라이트/다크 테마에 맞춰 다시 렌더링되고, `Expand` 버튼으로 크게 볼 수 있습니다.

### Callout

```mdx
<Callout type="tip" title="제목">내용</Callout>   {/* info | tip | warn | perf */}
```

## 커스터마이징

- 작성자 정보, 내비게이션: `src/lib/site.ts`
- 색상 토큰(라이트/다크): `src/app/globals.css`의 `:root`, `.dark`
- 홈 로드맵 항목, 주간 목표: `src/components/home/roadmap-card.tsx`
- 학습 통계: `src/lib/study-data.ts` (현재 목업 데이터 — WakaTime/GitHub API 등으로 교체 가능)
