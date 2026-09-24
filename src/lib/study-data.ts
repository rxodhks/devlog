import type { CategoryId } from "@/types/post";
import { mulberry32 } from "@/lib/utils";

/**
 * 홈 대시보드용 학습 통계 목업 데이터.
 * 시드 고정 난수라 서버/클라이언트 렌더 결과가 항상 같습니다.
 * 실제 데이터로 바꾸려면 이 모듈만 교체하면 됩니다 (예: WakaTime, GitHub API, Notion DB).
 */
export interface StudyStats {
  weekly: { day: string; hours: number }[];
  heatmap: number[][]; // [week][day] → level 0~4
  streak: number;
  thisWeek: number;
  lastWeek: number;
  byCategory: { id: CategoryId; hours: number }[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getStudyStats(seed = 20260923): StudyStats {
  const rand = mulberry32(seed);

  const weekly = DAYS.map((day, i) => ({
    day,
    hours: Math.round((1.2 + rand() * 3.8 + (i >= 5 ? 1.2 : 0)) * 10) / 10,
  }));

  const WEEKS = 18;
  const heatmap = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, () => {
      const trend = 0.35 + (w / WEEKS) * 0.5; // 최근일수록 더 꾸준히
      const r = rand();
      if (r > trend + 0.3) return 0;
      return Math.min(4, Math.floor(rand() * 4 * trend + 1));
    }),
  );
  // 최근 3주는 매일 학습한 것으로 (연속 학습 streak 연출)
  for (let w = WEEKS - 3; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) heatmap[w][d] = Math.max(heatmap[w][d], 1);
  }

  // streak = 마지막 날부터 거꾸로 연속된 학습일 수
  const flat = heatmap.flat();
  let streak = 0;
  for (let i = flat.length - 1; i >= 0 && flat[i] > 0; i--) streak++;

  const thisWeek = Math.round(weekly.reduce((a, b) => a + b.hours, 0) * 10) / 10;

  return {
    weekly,
    heatmap,
    streak,
    thisWeek,
    lastWeek: Math.round(thisWeek * 0.86 * 10) / 10,
    byCategory: [
      { id: "database", hours: 14.5 },
      { id: "python", hours: 9 },
      { id: "cs", hours: 8 },
      { id: "network", hours: 6.5 },
    ],
  };
}
