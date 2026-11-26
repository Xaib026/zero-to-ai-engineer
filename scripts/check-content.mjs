// Checks content/course.js for mistakes that would break a lesson's diagram.
// Usage: node scripts/check-content.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../content/course.js", import.meta.url), "utf8");
const { SECTIONS, SCENES, MODULES, PAYLOAD } = vm.runInNewContext(src + "\n({ SECTIONS, SCENES, MODULES, PAYLOAD })");

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);
const key = (a, b) => [a, b].sort().join("|");

const sectionIds = SECTIONS.flatMap((s) => s.ids);
check(sectionIds.length === MODULES.length, "every lesson must appear in exactly one section");
for (const m of MODULES) {
  check(sectionIds.includes(m.id), `${m.id}: not listed in any section`);
  check(m.quiz.every((q) => q.a >= 0 && q.a < q.o.length), `${m.id}: a quiz answer index is out of range`);
  const sc = SCENES[m.id];
  if (!check(sc, `${m.id}: has no scene`)) continue;
  const drawn = new Set(sc.edges.map(([a, b]) => key(a, b)));
  sc.edges.forEach(([a, b]) => check(sc.nodes[a] && sc.nodes[b], `${m.id}: edge ${a}-${b} uses a node that doesn't exist`));
  sc.steps.forEach((s, i) => {
    const at = `${m.id} step ${i + 1}`;
    s.e.forEach(([a, b]) => check(drawn.has(key(a, b)), `${at}: edge ${a}-${b} isn't in the scene's edges`));
    [...(s.h || []), ...(s.w || [])].forEach((n) => check(sc.nodes[n], `${at}: node ${n} doesn't exist`));
    check(s.m.length === sc.metrics.length, `${at}: has ${s.m.length} metric values, expected ${sc.metrics.length}`);
    check(s.t && s.b && s.q, `${at}: needs a title (t), body (b) and question (q)`);
  });
  if (PAYLOAD[m.id]) check(PAYLOAD[m.id].length === sc.steps.length, `${m.id}: PAYLOAD needs one label per step`);
}

if (errors.length) {
  console.error(errors.map((e) => "✗ " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${MODULES.length} lessons, ${Object.values(SCENES).reduce((n, s) => n + s.steps.length, 0)} steps: content looks good`);
