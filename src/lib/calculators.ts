/**
 * <MathCalc id="..."/> 에서 사용하는 인터랙티브 수식 계산기 레지스트리.
 * - tex:   KaTeX로 렌더링할 수식 (서버에서 HTML로 변환 → 클라이언트 번들에 KaTeX 미포함)
 * - variables: 팝오버에서 슬라이더로 조절할 변수
 * - outputs:   변수로부터 계산되는 결과값
 */

export type Scale = "linear" | "log";

export interface CalcVariable {
  key: string;
  /** 변수 기호 (TeX) */
  tex: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  scale?: Scale;
  unit?: string;
  format?: (n: number) => string;
}

export interface CalcOutput {
  key: string;
  label: string;
  tex?: string;
  compute: (v: Record<string, number>) => number;
  format: (n: number) => string;
  /** 비교 막대그래프에 포함할지 여부 */
  bar?: boolean;
  emphasis?: boolean;
}

export interface Calculator {
  id: string;
  title: string;
  tex: string;
  description: string;
  variables: CalcVariable[];
  outputs: CalcOutput[];
  /** 막대그래프를 로그 스케일로 표시 (값 차이가 수십~수만 배일 때) */
  logBars?: boolean;
  footnote?: string;
}

/* ───────── number formatters ───────── */

export const fmt = {
  int: (n: number) => Math.round(n).toLocaleString("en-US"),
  fixed: (d: number) => (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }),
  compact: (n: number) =>
    Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n),
  bytes: (n: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(v < 10 && i > 0 ? 2 : v < 100 && i > 0 ? 1 : 0)} ${units[i]}`;
  },
  bps: (bitsPerSec: number) => {
    const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
    let i = 0;
    let v = bitsPerSec;
    while (v >= 1000 && i < units.length - 1) {
      v /= 1000;
      i++;
    }
    return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
  },
  percent: (n: number) => `${(n * 100).toFixed(n < 0.001 ? 4 : 2)}%`,
  times: (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 2 : 0 })}×`,
};

const log2 = Math.log2;

/** log2(N!) — Stirling 근사 (N이 커도 O(1)) */
function log2Factorial(n: number) {
  if (n < 2) return 0;
  if (n < 32) {
    let s = 0;
    for (let k = 2; k <= n; k++) s += log2(k);
    return s;
  }
  return n * log2(n) - n * Math.LOG2E + 0.5 * log2(2 * Math.PI * n);
}

/* ───────── registry ───────── */

export const calculators: Record<string, Calculator> = {
  nlogn: {
    id: "nlogn",
    title: "성장률 비교: N log N vs N²",
    tex: "O(N \\log N)",
    description: "입력 크기 N을 바꿔 가며 정렬 기반 연산과 중첩 루프(상관 서브쿼리)의 연산량을 비교합니다.",
    variables: [
      {
        key: "n",
        tex: "N",
        label: "입력 크기 (rows)",
        min: 10,
        max: 10_000_000,
        defaultValue: 100_000,
        scale: "log",
        format: fmt.compact,
      },
    ],
    outputs: [
      { key: "n", label: "선형", tex: "N", compute: (v) => v.n, format: fmt.compact, bar: true },
      {
        key: "nlogn",
        label: "정렬 / 윈도우 함수",
        tex: "N \\log_2 N",
        compute: (v) => v.n * log2(v.n),
        format: fmt.compact,
        bar: true,
        emphasis: true,
      },
      { key: "n2", label: "중첩 루프", tex: "N^2", compute: (v) => v.n * v.n, format: fmt.compact, bar: true },
      {
        key: "ratio",
        label: "N² / N log N",
        compute: (v) => (v.n * v.n) / (v.n * log2(v.n)),
        format: fmt.times,
      },
    ],
    logBars: true,
    footnote: "막대는 로그 스케일입니다. 상수항과 캐시 효과는 무시한 이론적 연산 횟수입니다.",
  },

  "sort-lower-bound": {
    id: "sort-lower-bound",
    title: "비교 정렬의 하한: log₂(N!)",
    tex: "\\log_2 (N!) \\approx N \\log_2 N - N \\log_2 e",
    description: "N개의 원소를 정렬하는 모든 비교 기반 알고리즘은 최악의 경우 최소 ⌈log₂(N!)⌉번 비교해야 합니다.",
    variables: [
      {
        key: "n",
        tex: "N",
        label: "원소 개수",
        min: 2,
        max: 1_000_000,
        defaultValue: 1_000,
        scale: "log",
        format: fmt.compact,
      },
    ],
    outputs: [
      {
        key: "lb",
        label: "최소 비교 횟수",
        tex: "\\lceil \\log_2 N! \\rceil",
        compute: (v) => Math.ceil(log2Factorial(v.n)),
        format: fmt.compact,
        bar: true,
        emphasis: true,
      },
      {
        key: "nlogn",
        label: "병합 정렬 상한",
        tex: "N \\lceil \\log_2 N \\rceil",
        compute: (v) => v.n * Math.ceil(log2(v.n)),
        format: fmt.compact,
        bar: true,
      },
      {
        key: "gap",
        label: "하한 대비 비율",
        compute: (v) => (v.n * Math.ceil(log2(v.n))) / Math.max(1, Math.ceil(log2Factorial(v.n))),
        format: fmt.times,
      },
    ],
  },

  mathis: {
    id: "mathis",
    title: "TCP 처리량 추정 (Mathis 공식)",
    tex: "\\text{Throughput} \\le \\frac{\\text{MSS}}{\\text{RTT}} \\cdot \\frac{C}{\\sqrt{p}}",
    description: "Reno 계열 TCP의 정상 상태 처리량 상한. 패킷 손실률 p가 조금만 늘어도 처리량이 급감합니다. (C ≈ 1.22)",
    variables: [
      { key: "mss", tex: "\\text{MSS}", label: "세그먼트 크기", min: 536, max: 9000, step: 4, defaultValue: 1460, unit: "B", format: fmt.int },
      { key: "rtt", tex: "\\text{RTT}", label: "왕복 지연", min: 1, max: 300, step: 1, defaultValue: 40, unit: "ms", format: fmt.int },
      {
        key: "p",
        tex: "p",
        label: "패킷 손실률",
        min: 0.00001,
        max: 0.05,
        defaultValue: 0.0001,
        scale: "log",
        format: fmt.percent,
      },
    ],
    outputs: [
      {
        key: "tput",
        label: "최대 처리량",
        compute: (v) => ((v.mss * 8) / (v.rtt / 1000)) * (1.22 / Math.sqrt(v.p)),
        format: fmt.bps,
        emphasis: true,
      },
      {
        key: "perRtt",
        label: "RTT당 평균 전송 세그먼트",
        compute: (v) => 1.22 / Math.sqrt(v.p),
        format: fmt.fixed(1),
      },
    ],
  },

  bdp: {
    id: "bdp",
    title: "대역폭-지연 곱 (BDP)",
    tex: "\\text{BDP} = \\text{Bandwidth} \\times \\text{RTT}",
    description: "파이프를 가득 채우려면 전송 중(in-flight)인 데이터가 BDP만큼 있어야 합니다. 수신 윈도우가 이보다 작으면 링크를 다 쓰지 못합니다.",
    variables: [
      {
        key: "bw",
        tex: "\\text{Bandwidth}",
        label: "대역폭",
        min: 1,
        max: 100_000,
        defaultValue: 1_000,
        scale: "log",
        unit: "Mbps",
        format: fmt.compact,
      },
      { key: "rtt", tex: "\\text{RTT}", label: "왕복 지연", min: 1, max: 300, step: 1, defaultValue: 40, unit: "ms", format: fmt.int },
    ],
    outputs: [
      {
        key: "bdp",
        label: "필요 윈도우 크기",
        compute: (v) => (v.bw * 1e6 * (v.rtt / 1000)) / 8,
        format: fmt.bytes,
        emphasis: true,
      },
      {
        key: "segments",
        label: "in-flight 세그먼트 (MSS 1460B)",
        compute: (v) => (v.bw * 1e6 * (v.rtt / 1000)) / 8 / 1460,
        format: fmt.int,
      },
      {
        key: "util64k",
        label: "64KB 윈도우 시 링크 활용률",
        compute: (v) => Math.min(1, 65_535 / ((v.bw * 1e6 * (v.rtt / 1000)) / 8)),
        format: fmt.percent,
      },
    ],
  },

  "generator-memory": {
    id: "generator-memory",
    title: "리스트 vs 제너레이터 메모리",
    tex: "M_{\\text{list}}(N) = O(N), \\quad M_{\\text{gen}}(N) = O(1)",
    description: "CPython 64-bit 기준 대략적인 메모리 사용량. 리스트는 포인터 배열(8B × N)과 원소 객체를 모두 보관합니다.",
    variables: [
      {
        key: "n",
        tex: "N",
        label: "원소 개수",
        min: 1_000,
        max: 100_000_000,
        defaultValue: 1_000_000,
        scale: "log",
        format: fmt.compact,
      },
      { key: "item", tex: "s", label: "원소 1개 크기 (int=28B)", min: 28, max: 1_024, step: 4, defaultValue: 28, unit: "B", format: fmt.int },
    ],
    outputs: [
      {
        key: "list",
        label: "list",
        compute: (v) => 56 + 8 * v.n * 1.125 + v.n * v.item,
        format: fmt.bytes,
        bar: true,
      },
      {
        key: "gen",
        label: "generator",
        compute: () => 200,
        format: fmt.bytes,
        bar: true,
        emphasis: true,
      },
    ],
    logBars: true,
    footnote: "list는 over-allocation(≈12.5%)을 반영한 근사치, generator는 프레임 객체 크기 기준입니다.",
  },
};

export type CalculatorId = keyof typeof calculators;

/** 슬라이더(0~1000) ↔ 실제 값 변환 */
export function toSlider(variable: CalcVariable, value: number) {
  if (variable.scale === "log") {
    const [a, b] = [Math.log(variable.min), Math.log(variable.max)];
    return ((Math.log(value) - a) / (b - a)) * 1000;
  }
  return ((value - variable.min) / (variable.max - variable.min)) * 1000;
}

export function fromSlider(variable: CalcVariable, pos: number) {
  const t = pos / 1000;
  if (variable.scale === "log") {
    const [a, b] = [Math.log(variable.min), Math.log(variable.max)];
    const raw = Math.exp(a + t * (b - a));
    // 보기 좋게 유효숫자 2자리로 반올림
    const mag = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
    return variable.min < 1 ? Number(raw.toPrecision(2)) : Math.round(raw / mag) * mag;
  }
  const step = variable.step ?? 1;
  return Math.round((variable.min + t * (variable.max - variable.min)) / step) * step;
}
