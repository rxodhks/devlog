import type { CategoryId } from "@/types/post";
import { mulberry32 } from "@/lib/utils";

/**
 * 홈 "공부의 흔적" 목업 데이터.
 * 시드 고정 난수 + 고정 기준일이라 서버/클라이언트 렌더 결과가 항상 같습니다.
 * 실제 기록으로 바꾸려면 이 모듈만 교체하세요 (예: WakaTime, GitHub, 노션 DB, 직접 적은 JSON).
 */
export interface StudyDay {
  date: string; // YYYY-MM-DD
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
  /** 기준일 이후(아직 오지 않은 날) */
  future: boolean;
}

export interface StudyStats {
  /** 주 단위 열 → 월(0)~일(6) */
  weeks: StudyDay[][];
  thisWeek: { label: string; hours: number }[];
  totalHours: number;
  activeDays: number;
  streak: number;
  byCategory: { id: CategoryId; hours: number }[];
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function levelOf(hours: number): StudyDay["level"] {
  if (hours <= 0) return 0;
  if (hours < 1.5) return 1;
  if (hours < 3) return 2;
  if (hours < 4.5) return 3;
  return 4;
}

/**
 * @param anchorISO 기준일(보통 가장 최근 글 날짜). 이 날짜가 속한 주까지 표시합니다.
 */
export function getStudyStats(anchorISO: string, weeksCount = 34, seed = 20260923): StudyStats {
  const rand = mulberry32(seed);
  const anchor = new Date(`${anchorISO}T00:00:00Z`);
  // 기준일이 속한 주의 월요일
  const dow = (anchor.getUTCDay() + 6) % 7;
  const lastMonday = new Date(anchor);
  lastMonday.setUTCDate(anchor.getUTCDate() - dow);

  const weeks: StudyDay[][] = [];
  for (let w = weeksCount - 1; w >= 0; w--) {
    const monday = new Date(lastMonday);
    monday.setUTCDate(lastMonday.getUTCDate() - w * 7);
    const week: StudyDay[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + d);
      const progress = 1 - w / weeksCount; // 최근일수록 더 꾸준히
      const skip = rand() > 0.45 + progress * 0.45;
      const recent = w < 3; // 최근 3주는 매일
      const future = day > anchor;
      let hours = 0;
      if (!future && (recent || !skip)) {
        hours = Math.round((0.5 + rand() * (2 + progress * 3.2) + (d >= 5 ? 0.8 : 0)) * 2) / 2;
      }
      week.push({ date: toISO(day), hours, level: levelOf(hours), future });
    }
    weeks.push(week);
  }

  const days = weeks.flat().filter((d) => !d.future);
  let streak = 0;
  for (let i = days.length - 1; i >= 0 && days[i].hours > 0; i--) streak++;

  const last = weeks[weeks.length - 1].filter((d) => !d.future);
  const totalHours = days.reduce((a, d) => a + d.hours, 0);

  return {
    weeks,
    thisWeek: last.map((d, i) => ({ label: DAY_LABELS[i], hours: d.hours })),
    totalHours: Math.round(totalHours),
    activeDays: days.filter((d) => d.hours > 0).length,
    streak,
    byCategory: [
      { id: "database", hours: Math.round(totalHours * 0.38) },
      { id: "python", hours: Math.round(totalHours * 0.24) },
      { id: "cs", hours: Math.round(totalHours * 0.22) },
      { id: "network", hours: Math.round(totalHours * 0.16) },
    ],
  };
}
