"use client";

import { motion } from "framer-motion";

/** Python 카드: REPL 미리보기 */
export function PythonRepl() {
  const lines = [
    { p: ">>>", code: "gen = (n * n for n in range(10**9))" },
    { p: ">>>", code: "next(gen), next(gen), next(gen)" },
    { p: "", code: "(0, 1, 4)", out: true },
    { p: ">>>", code: "sys.getsizeof(gen)" },
    { p: "", code: "208  # bytes, not gigabytes", out: true },
  ];
  return (
    <div className="rounded-xl border border-border bg-[rgb(var(--code-bg))] px-3 py-2.5 font-mono text-[11px] leading-[1.7]">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.12 }}
          className="truncate"
        >
          {l.p && <span className="mr-1.5 text-cat-python">{l.p}</span>}
          <span className={l.out ? "text-success" : "text-foreground/85"}>{l.code}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Network 카드: 패킷이 오가는 애니메이션 */
export function PacketFlow() {
  return (
    <div className="relative h-[92px] overflow-hidden rounded-xl border border-border bg-[rgb(var(--code-bg))]">
      <svg viewBox="0 0 240 92" className="absolute inset-0 size-full" aria-hidden>
        <line x1="36" y1="46" x2="204" y2="46" className="stroke-border" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx="30" cy="46" r="12" className="fill-cat-network/15 stroke-cat-network" strokeWidth="1.5" />
        <circle cx="210" cy="46" r="12" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
        <text x="30" y="74" textAnchor="middle" className="fill-muted font-mono text-[8px]">client</text>
        <text x="210" y="74" textAnchor="middle" className="fill-muted font-mono text-[8px]">server</text>
      </svg>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="absolute top-[42px] h-2 w-4 rounded-sm bg-cat-network shadow-[0_0_8px_rgb(var(--cat-network))]"
          initial={{ left: "18%", opacity: 0 }}
          animate={{ left: ["18%", "78%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.span
        className="absolute top-[52px] h-1.5 w-3 rounded-sm bg-success"
        initial={{ left: "78%", opacity: 0 }}
        animate={{ left: ["78%", "18%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, delay: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="absolute left-3 top-2 font-mono text-[9.5px] text-muted">cwnd = 10 MSS</span>
      <span className="absolute right-3 top-2 font-mono text-[9.5px] text-success">ACK</span>
    </div>
  );
}
