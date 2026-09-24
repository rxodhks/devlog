import katex from "katex";

import { MathCalcClient } from "@/components/mdx/math-calc-client";
import { calculators } from "@/lib/calculators";

const tex = (src: string, displayMode = false) =>
  katex.renderToString(src, { throwOnError: false, displayMode, output: "html" });

/**
 * 인터랙티브 수식: 수식을 클릭하면 변수 슬라이더가 있는 미니 계산기 팝오버가 열립니다.
 * KaTeX 렌더링은 서버에서 끝내고 HTML만 클라이언트로 전달합니다.
 *
 * MDX: <MathCalc id="nlogn" />            (inline)
 *      <MathCalc id="mathis" block />     (display)
 */
export function MathCalc({ id, block = false }: { id: string; block?: boolean }) {
  const calc = calculators[id];
  if (!calc) {
    return <code className="text-danger">[MathCalc] unknown id: {id}</code>;
  }

  return (
    <MathCalcClient
      id={id}
      block={block}
      formulaHtml={tex(calc.tex, block)}
      popoverFormulaHtml={tex(calc.tex, true)}
      variableHtml={Object.fromEntries(calc.variables.map((v) => [v.key, tex(v.tex)]))}
      outputHtml={Object.fromEntries(calc.outputs.filter((o) => o.tex).map((o) => [o.key, tex(o.tex!)]))}
    />
  );
}
