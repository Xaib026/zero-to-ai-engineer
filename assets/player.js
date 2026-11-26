/* Course player: routing, animated diagrams, labs and progress. Content lives in content/course.js. */
/* ---------- labs ---------- */
function softmax(logits, T){
  if (T <= 0) { const mx = logits.indexOf(Math.max(...logits)); return logits.map((_, i) => i === mx ? 1 : 0); }
  const mx = Math.max(...logits), e = logits.map(l => Math.exp((l - mx) / T)), s = e.reduce((a, b) => a + b, 0);
  return e.map(x => x / s);
}
const cosine = (a, b) => { const n = Math.hypot(...a) * Math.hypot(...b); return n ? (a[0]*b[0] + a[1]*b[1]) / n : 0; };
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money = x => "$" + (x < 1 ? x.toFixed(4) : x.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}));

const WIDGETS = {
  tokens(el){
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>See text the way a model does</h3>
      <p class="lab-note">Type anything. This toy breaks words into chunks of up to 4 letters, roughly how real tokenizers split rare words. Real tokenizers learn their splits from data, so treat counts as estimates.</p>
      <label class="sr" for="tok-in">Text to tokenize</label>
      <textarea id="tok-in" rows="3">Tokenization isn't magic: unbelievably long words become several pieces. 日本語のテキスト</textarea>
      <div class="tok-out" aria-live="polite"></div><div class="stats"></div>`;
    const inp = el.querySelector("textarea"), out = el.querySelector(".tok-out"), st = el.querySelector(".stats");
    const run = () => {
      const toks = inp.value.match(/\s*[A-Za-z]{1,4}|\s*\d{1,3}|\s*[^\sA-Za-z\d]|\s+/g) || [];
      out.innerHTML = toks.map(t => `<span class="tok">${esc(t)}</span>`).join("");
      const chars = inp.value.length;
      st.innerHTML = `<span>tokens <b>${toks.length}</b></span><span>characters <b>${chars}</b></span><span>chars per token <b>${toks.length ? (chars / toks.length).toFixed(1) : "–"}</b></span>`;
    };
    inp.addEventListener("input", run); run();
  },

  temp(el){
    const C = [["mat",3.2],["floor",2.5],["sofa",2.1],["roof",1.4],["keyboard",1.0],["moon",-0.5]];
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>Temperature and the next token</h3>
      <p class="lab-note">Prompt: <code>The cat sat on the …</code> The model has scored six candidate tokens. Move the slider to see how temperature reshapes the probabilities, then sample.</p>
      <div class="row"><label for="temp-in">Temperature <b class="mono" id="temp-val">1.0</b></label><input type="range" id="temp-in" min="0" max="2" step="0.1" value="1"></div>
      <div class="bars"></div>
      <div class="row"><button class="btn small" id="temp-sample">Sample 12 tokens</button><span class="samples" aria-live="polite"></span></div>`;
    const r = el.querySelector("#temp-in"), bars = el.querySelector(".bars"), smp = el.querySelector(".samples");
    const probs = () => softmax(C.map(c => c[1]), +r.value);
    const draw = () => { el.querySelector("#temp-val").textContent = (+r.value).toFixed(1); const p = probs();
      bars.innerHTML = C.map((c, i) => `<div class="bar-row"><span>${c[0]}</span><div class="bar-track"><div class="bar-fill" style="width:${(p[i]*100).toFixed(1)}%"></div></div><span class="pct">${(p[i]*100).toFixed(1)}%</span></div>`).join(""); };
    el.querySelector("#temp-sample").onclick = () => { const p = probs(); const out = [];
      for (let k = 0; k < 12; k++) { let x = Math.random(), i = 0; while (i < p.length - 1 && (x -= p[i]) > 0) i++; out.push(C[i][0]); }
      smp.textContent = out.join(" · "); };
    r.addEventListener("input", draw); draw();
  },

  vectors(el){
    const v = {a:[3,1], b:[1,3]};
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>Drag two vectors, watch the similarity</h3>
      <p class="lab-note">Real embeddings have hundreds or thousands of dimensions, but the maths is the same in 2D. Drag the round handles. Notice that making an arrow longer doesn't change the cosine.</p>
      <div class="vec-wrap"><svg viewBox="-5.5 -5.5 11 11" role="img" aria-label="Two draggable vectors on a grid"></svg><div><dl class="kv"></dl><p class="verdict" style="margin-top:10px"></p></div></div>`;
    const svg = el.querySelector("svg"), kv = el.querySelector(".kv"), ver = el.querySelector(".verdict");
    let grid = "";
    for (let g = -5; g <= 5; g++) grid += `<line x1="${g}" y1="-5" x2="${g}" y2="5" stroke="var(--line)" stroke-width="${g ? .03 : .06}"/><line x1="-5" y1="${g}" x2="5" y2="${g}" stroke="var(--line)" stroke-width="${g ? .03 : .06}"/>`;
    const draw = () => {
      const {a, b} = v;
      svg.innerHTML = grid + [["a","var(--accent)"],["b","var(--signal)"]].map(([k, c]) => { const [x, y] = v[k];
        return `<line x1="0" y1="0" x2="${x}" y2="${-y}" stroke="${c}" stroke-width=".14" stroke-linecap="round"/>
        <circle class="handle" data-k="${k}" cx="${x}" cy="${-y}" r=".42" fill="${c}"/>
        <text x="${x + .5}" y="${-y - .4}" font-size=".7" fill="${c}" font-family="IBM Plex Mono, monospace">${k}</text>`; }).join("");
      const dot = a[0]*b[0] + a[1]*b[1], cs = cosine(a, b);
      kv.innerHTML = `<dt>a</dt><dd>(${a[0].toFixed(1)}, ${a[1].toFixed(1)})</dd><dt>b</dt><dd>(${b[0].toFixed(1)}, ${b[1].toFixed(1)})</dd>
        <dt>a · b</dt><dd>${dot.toFixed(2)}</dd><dt>|a| |b|</dt><dd>${(Math.hypot(...a) * Math.hypot(...b)).toFixed(2)}</dd>
        <dt>cosine</dt><dd><b>${cs.toFixed(3)}</b></dd><dt>angle</dt><dd>${(Math.acos(Math.max(-1, Math.min(1, cs))) * 180 / Math.PI).toFixed(0)}°</dd>`;
      ver.textContent = cs > .9 ? "Very similar direction: like two sentences that mean nearly the same thing."
        : cs > .5 ? "Related: sharing some meaning." : cs > -.2 ? "Close to unrelated (near 90°)." : "Pointing opposite ways.";
    };
    let drag = null;
    const toSvg = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener("pointerdown", e => { const k = e.target.dataset && e.target.dataset.k; if (k) { drag = k; svg.setPointerCapture(e.pointerId); } });
    svg.addEventListener("pointermove", e => { if (!drag) return; const p = toSvg(e);
      const cl = n => Math.round(Math.max(-5, Math.min(5, n)) * 10) / 10;
      const nx = cl(p.x), ny = cl(-p.y); if (nx || ny) { v[drag] = [nx, ny]; draw(); } });
    svg.addEventListener("pointerup", () => drag = null);
    svg.addEventListener("pointercancel", () => drag = null);
    draw();
  },

  cost(el){
    const f = [["cost-in","Input tokens per request",2000],["cost-out","Output tokens per request",500],["cost-pin","$ per 1M input tokens",3],["cost-pout","$ per 1M output tokens",15],["cost-req","Requests per day",1000]];
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>What will this feature cost?</h3>
      <p class="lab-note">The prices filled in are examples only. Check your provider's current price list and swap in real numbers.</p>
      <div class="grid3">${f.map(([id, l, d]) => `<label for="${id}">${l}<input type="number" id="${id}" min="0" step="any" value="${d}"></label>`).join("")}</div>
      <div class="stats" aria-live="polite"></div>`;
    const st = el.querySelector(".stats");
    const run = () => { const g = id => Math.max(0, +el.querySelector("#" + id).value || 0);
      const per = g("cost-in") * g("cost-pin") / 1e6 + g("cost-out") * g("cost-pout") / 1e6, day = per * g("cost-req");
      const outShare = per ? g("cost-out") * g("cost-pout") / 1e6 / per : 0;
      st.innerHTML = `<span>per request <b>${money(per)}</b></span><span>per day <b>${money(day)}</b></span><span>per 30 days <b>${money(day * 30)}</b></span><span>output share <b>${Math.round(outShare * 100)}%</b></span>`; };
    el.addEventListener("input", run); run();
  },

  prompt(el){
    const weak = "summarize this email";
    const strong = `You are helping a busy support lead triage email.
Read the email in <email> tags and return JSON with keys "summary" (one sentence, at most 25 words), "intent" (one of: refund, bug, question, other) and "urgent" (true or false).
Only use facts stated in the email. If the intent is unclear, use "other".

Example:
<email>My invoice charged me twice this month, please fix ASAP.</email>
{"summary": "Customer was double-charged and wants it fixed quickly.", "intent": "refund", "urgent": true}

<email>
{{EMAIL}}
</email>`;
    const checks = [
      ["Says who it's for or what role to take", /\b(you are|act as|audience|for a|helping)\b/i],
      ["Defines the output format", /\b(json|format|bullet|table|return|respond with|output)\b/i],
      ["Includes an example", /\b(example|e\.g\.|for instance)\b/i],
      ["Separates data from instructions", /<[a-z_]+>|```|"""/i],
      ["Sets constraints", /\b(must|only|do not|don't|at most|no more than|one of)\b/i],
      ["Gives enough detail (40+ words)", s => s.trim().split(/\s+/).length >= 40],
    ];
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>Prompt checklist</h3>
      <p class="lab-note">A rough heuristic check against the habits in this module. It looks for signals, not quality, so use it as a reminder, not a grade.</p>
      <label class="sr" for="pr-in">Your prompt</label><textarea id="pr-in" rows="8"></textarea>
      <div class="row"><button class="btn small" id="pr-strong">Load a stronger version</button><button class="btn small" id="pr-weak">Load the weak version</button><span class="stats" id="pr-score"></span></div>
      <ul class="checks" aria-live="polite"></ul>`;
    const ta = el.querySelector("textarea"), ul = el.querySelector(".checks");
    const run = () => { const s = ta.value; let n = 0;
      ul.innerHTML = checks.map(([l, t]) => { const ok = typeof t === "function" ? t(s) : t.test(s); n += ok;
        return `<li><span class="pill ${ok ? "yes" : "no"}">${ok ? "yes" : "missing"}</span>${l}</li>`; }).join("");
      el.querySelector("#pr-score").innerHTML = `<span><b>${n}/${checks.length}</b> signals</span>`; };
    el.querySelector("#pr-strong").onclick = () => { ta.value = strong; run(); };
    el.querySelector("#pr-weak").onclick = () => { ta.value = weak; run(); };
    ta.value = weak; ta.addEventListener("input", run); run();
  },

  rag(el){
    const Q = "How many vacation days do new full-time employees get?";
    const chunks = [
      ["handbook.md §4.1","Full-time employees accrue 20 paid vacation days per year, starting from their first day.",.89,.95],
      ["contractors.md §2","Contractors are not eligible for paid vacation days; any time off is unpaid.",.84,.31],
      ["handbook.md §4.3","Unused vacation days carry over to the next year, up to a maximum of 5 days.",.78,.74],
      ["onboarding.md §1","New employees receive a laptop and an access badge on their first day.",.71,.22],
      ["handbook.md §6.2","Parental leave is 16 weeks at full pay for all full-time employees.",.62,.18],
      ["benefits.md §3","Health insurance starts on the first of the month after joining.",.55,.12],
    ];
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>Step through retrieval</h3>
      <p class="lab-note">Question: <b>${Q}</b><br>Scores are toy numbers. Change top-k and turn reranking on to see which chunks reach the model.</p>
      <div class="row"><label for="rag-k">Top-k <b class="mono" id="rag-kv">3</b></label><input type="range" id="rag-k" min="1" max="6" value="3">
        <label class="check" for="rag-rr"><input type="checkbox" id="rag-rr">Rerank results</label></div>
      <div class="chunks"></div>
      <p class="caption" id="rag-cap"></p>
      <span class="eyebrow">Prompt sent to the model</span><pre id="rag-prompt"></pre>`;
    const k = el.querySelector("#rag-k"), rr = el.querySelector("#rag-rr");
    const run = () => {
      const kk = +k.value, col = rr.checked ? 3 : 2;
      el.querySelector("#rag-kv").textContent = kk;
      const ranked = [...chunks].sort((x, y) => y[col] - x[col]);
      el.querySelector(".chunks").innerHTML = ranked.map((c, i) => `<div class="chunk ${i < kk ? "in" : ""}"><span class="sc">${c[col].toFixed(2)}</span><span>${c[1]}<small>${c[0]}</small></span></div>`).join("");
      const top = ranked.slice(0, kk);
      const hasAns = top.some(c => c[0] === "handbook.md §4.1"), hasDis = top.some(c => c[0] === "contractors.md §2");
      el.querySelector("#rag-cap").textContent = !hasAns ? "The answer isn't in the context, so the model can't ground its reply."
        : hasDis ? "The contractors chunk ranks high because it shares words with the question, yet it's about a different group. Reranking pushes it down."
        : kk > 3 ? "The answer is there, but extra chunks add tokens and noise." : "Good: the answer is in context with little noise.";
      el.querySelector("#rag-prompt").textContent = `Answer using only the sources below. Cite sources like [1].
If the answer isn't in the sources, say you don't know.

${top.map((c, i) => `<source id="${i + 1}" file="${c[0]}">\n${c[1]}\n</source>`).join("\n")}

Question: ${Q}`;
    };
    k.addEventListener("input", run); rr.addEventListener("change", run); run();
  },

  agent(el){
    const S = [
      ["user","User","Will it rain in Lisbon tomorrow? If so, remind me to take an umbrella.","The task arrives. Your code sends it to the model together with the descriptions of two tools: get_forecast and create_reminder."],
      ["assistant","Model · stop_reason: tool_use",'tool_use  get_forecast\n{"city": "Lisbon", "day": "tomorrow"}',"The model doesn't run anything. It returns a request for your code to call a tool, with arguments that match the tool's schema."],
      ["tool","Your code · tool_result",'{"rain_chance": 0.7, "high_c": 17}',"Your code calls the real weather service and sends the result back as a new message."],
      ["assistant","Model · stop_reason: tool_use",'tool_use  create_reminder\n{"text": "Take an umbrella", "time": "tomorrow 08:00"}',"With the new information, the model decides it needs a second tool."],
      ["tool","Your code · tool_result",'{"ok": true, "id": "rem_481"}',"Your code creates the reminder. For anything irreversible, this is where you'd ask the user first."],
      ["assistant","Model · stop_reason: end_turn","There's a 70% chance of rain in Lisbon tomorrow, with a high of 17 °C. I've set a reminder for 8:00 to take an umbrella.","No more tool calls, so the loop ends. A step limit in your code stops a confused agent from looping forever."],
    ];
    let n = 1;
    el.innerHTML = `<span class="eyebrow">Lab</span><h3>Walk through the agent loop</h3>
      <div class="transcript" aria-live="polite"></div><p class="caption"></p>
      <div class="row"><button class="btn small primary" id="ag-next">Next step</button><button class="btn small" id="ag-reset">Reset</button><span class="meter-label" id="ag-step"></span></div>`;
    const draw = () => {
      el.querySelector(".transcript").innerHTML = S.slice(0, n).map(([c, w, t]) => `<div class="msg ${c}"><span class="who">${w}</span><pre>${esc(t)}</pre></div>`).join("");
      el.querySelector(".caption").textContent = S[n - 1][3];
      el.querySelector("#ag-step").textContent = `step ${n} of ${S.length}`;
      el.querySelector("#ag-next").disabled = n === S.length;
    };
    el.querySelector("#ag-next").onclick = () => { if (n < S.length) { n++; draw(); } };
    el.querySelector("#ag-reset").onclick = () => { n = 1; draw(); };
    draw();
  },
};


/* ---------- state ---------- */
const KEY = "zero-to-ai-engineer-v2";
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.seen && s.done && s.quiz) return s; } catch(e){} return {seen:{}, done:{}, quiz:{}}; }
let state = load();
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
const $ = s => document.querySelector(s);
const byId = id => MODULES.find(m => m.id === id);
const pad = n => String(n).padStart(2, "0");
const numOf = id => pad(MODULES.findIndex(m => m.id === id) + 1);
const lessonDone = m => (state.seen[m.id] ?? -1) >= SCENES[m.id].steps.length - 1;
const sectionOf = id => SECTIONS.find(s => s.ids.includes(id));
const quizScore = m => { const picks = m.quiz.map((q, j) => state.quiz[m.id + "-q" + j]);
  return {right:picks.filter((p, j) => p === m.quiz[j].a).length, answered:picks.filter(p => p !== undefined).length, total:m.quiz.length}; };
const hrefFor = (id, tab, step) => "#" + id + (tab && tab !== "learn" ? "-" + tab : step ? "-s" + (step + 1) : "");
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SV = "http://www.w3.org/2000/svg";
const STEP_MS = 7000;

let view = {id:null, tab:null, step:0};
const anim = {pk:[], playing:false, segStart:0};

/* ---------- drawer ---------- */
const side = $("#side"), scrim = $("#scrim"), menuBtn = $("#menu-btn");
function openMenu(){ side.classList.add("open"); scrim.hidden = false; menuBtn.setAttribute("aria-expanded","true"); setTimeout(() => $("#find").focus(), 50); }
function closeMenu(){ side.classList.remove("open"); scrim.hidden = true; menuBtn.setAttribute("aria-expanded","false"); }
menuBtn.onclick = () => side.classList.contains("open") ? closeMenu() : openMenu();
scrim.onclick = closeMenu; $("#side-close").onclick = closeMenu;

function refreshSide(){
  const done = MODULES.filter(lessonDone).length, steps = Object.values(SCENES).reduce((a, s) => a + s.steps.length, 0);
  $("#side-meta").textContent = `${MODULES.length} lessons · ${steps} animated steps · about ${MODULES.reduce((a, m) => a + m.hours, 0)} h`;
  $("#side-bar").style.width = (done / MODULES.length * 100) + "%";
  $("#side-count").textContent = `${done} / ${MODULES.length} · completed`;
  $("#top-prog").textContent = `${done} / ${MODULES.length} lessons`;
  const f = $("#find").value.trim().toLowerCase();
  $("#side-list").innerHTML = `<a class="li ${!view.id ? "cur" : ""}" href="#home"><span class="mono n">◆</span><span>Course overview</span><span></span></a>` + SECTIONS.map((s, si) => {
    const ids = s.ids.filter(id => !f || (byId(id).title + " " + SCENES[id].sub).toLowerCase().includes(f));
    if (!ids.length) return "";
    return `<div class="sec"><p class="sec-h"><span class="mono">${pad(si + 1)}</span>${s.name}</p>${ids.map(id => {
      const m = byId(id), st = lessonDone(m) ? "done" : state.seen[id] !== undefined ? "part" : "";
      return `<a class="li ${view.id === id ? "cur" : ""}" href="#${id}" ${view.id === id ? 'aria-current="page"' : ""}><span class="mono n">${numOf(id)}</span><span>${m.title}</span><span class="dot ${st}" title="${st === "done" ? "Completed" : st ? "In progress" : "Not started"}"></span></a>`;
    }).join("")}</div>`;
  }).join("") || `<p class="side-meta">No lesson matches that search.</p>`;
}
$("#find").addEventListener("input", refreshSide);

function renderTabs(){
  if (!view.id) { $("#tabs").innerHTML = ""; return; }
  const qs = quizScore(byId(view.id));
  $("#tabs").innerHTML = [["learn","Learn"],["notes","Notes"],["practice","Practice"],["quiz", qs.answered === qs.total ? `Quiz · ${qs.right}/${qs.total}` : "Quiz"]].map(([k, l]) =>
    `<a href="${hrefFor(view.id, k)}" class="${view.tab === k ? "on" : ""}" ${view.tab === k ? 'aria-current="page"' : ""}>${l}</a>`).join("");
}

/* ---------- scene ---------- */
const key = (a, b) => [a, b].sort().join("|");
function geom(A, B){
  const [x1, y1] = A, [x2, y2] = B, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, r = 38;
  const sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * r, ey = y2 - uy * r, bend = Math.abs(dy) < 1 ? 0 : 0.12;
  const cx = (sx + ex) / 2 - uy * L * bend, cy = (sy + ey) / 2 + ux * L * bend;
  return {d:`M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, mx:.25 * sx + .5 * cx + .25 * ex, my:.25 * sy + .5 * cy + .25 * ey};
}
function buildScene(sc){
  let e = "", l = "";
  sc.edges.forEach(([a, b, label]) => {
    const k = key(a, b), [p, q] = k.split("|"), G = geom(sc.nodes[p], sc.nodes[q]);
    e += `<path class="edge" data-e="${k}" d="${G.d}"/><path class="flow" data-f="${k}" d="${G.d}"/>`;
    if (label) l += `<text class="elabel" x="${G.mx.toFixed(1)}" y="${(G.my - 7).toFixed(1)}">${esc(label)}</text>`;
  });
  const nodes = Object.entries(sc.nodes).map(([id, [x, y, g, lab, sub]], i) =>
    `<g class="node" data-n="${id}" tabindex="0" role="button" aria-label="${esc(lab)}: show its role" transform="translate(${x} ${y})">
      <g class="nin" style="animation-delay:${i * 90}ms"><rect class="ring" x="-28" y="-28" width="56" height="56" rx="14"/><rect class="nbox" x="-28" y="-28" width="56" height="56" rx="14"/>
      <text class="glyph" y="5">${esc(g)}</text><circle class="ndot" cx="22" cy="-22" r="3.5"/></g>
      <text class="nl" y="47">${esc(lab)}</text>${sub ? `<text class="ns" y="61">${esc(sub)}</text>` : ""}</g>`).join("");
  $("#scene").innerHTML = `<g>${e}</g><g>${l}</g><g class="packets"></g><g>${nodes}</g><g class="tags"></g>`;
}
function setPackets(act){
  const g = $("#scene .packets"); g.innerHTML = "";
  anim.pk = act.map((x, i) => {
    const p = $(`#scene .edge[data-e="${x.k}"]`), rev = x.a !== x.k.split("|")[0];
    const els = [0, 1].map(() => { const h = document.createElementNS(SV, "circle"), c = document.createElementNS(SV, "circle");
      h.setAttribute("r", 9); h.setAttribute("class", "pkh"); c.setAttribute("r", 4); c.setAttribute("class", "pk"); g.append(h, c); return [h, c]; });
    return {p, len:p.getTotalLength(), rev, els, ofs:i * 0.23};
  });
  const label = (PAYLOAD[view.id] || [])[view.step];
  anim.tag = null; $("#scene .tags").innerHTML = "";
  if (label && anim.pk.length) {
    const tg = document.createElementNS(SV, "g"), r = document.createElementNS(SV, "rect"), tx = document.createElementNS(SV, "text");
    tg.setAttribute("class", "tag"); tx.textContent = label; tg.append(r, tx); $("#scene .tags").append(tg);
    const w = tx.getBBox().width, h = tx.getBBox().height;
    r.setAttribute("x", -w / 2 - 7); r.setAttribute("y", -h / 2 - 4); r.setAttribute("width", w + 14); r.setAttribute("height", h + 8); r.setAttribute("rx", 6);
    anim.tag = tg;
  }
  drawPackets(REDUCE ? 0 : performance.now());
}
function drawPackets(t){
  anim.pk.forEach(k => k.els.forEach(([h, c], j) => {
    const u = (t / 1000 * 120 / k.len + k.ofs + j / k.els.length) % 1, vis = Math.min(1, u * 5, (1 - u) * 5);
    const pt = k.p.getPointAtLength((k.rev ? 1 - u : u) * k.len);
    for (const el of [h, c]) { el.setAttribute("cx", pt.x.toFixed(1)); el.setAttribute("cy", pt.y.toFixed(1)); }
    c.style.opacity = vis; h.style.opacity = vis * .22;
    if (j === 0 && k === anim.pk[0] && anim.tag && anim.tag.isConnected) {
      anim.tag.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${(pt.y - 22).toFixed(1)})`);
      anim.tag.style.opacity = REDUCE ? 1 : Math.min(1, vis * 1.4);
    }
  }));
}
function frame(t){
  if (!REDUCE) drawPackets(t);
  if (anim.playing) {
    const p = Math.min(1, (t - anim.segStart) / STEP_MS), seg = $(".seg.cur i");
    if (seg) seg.style.width = (p * 100) + "%";
    if (p >= 1) { if (view.step < SCENES[view.id].steps.length - 1) go(view.step + 1); else setPlaying(false); }
  }
  requestAnimationFrame(frame);
}
function setPlaying(on){
  anim.playing = on;
  const b = $("#play"); if (b) { b.textContent = on ? "❚❚ Pause" : "▶ Play"; b.setAttribute("aria-pressed", on); }
  document.querySelectorAll(".seg i").forEach(i => i.style.width = "");
  if (on) { anim.segStart = performance.now(); if (view.step === SCENES[view.id].steps.length - 1) go(0); }
}
const go = i => { location.hash = hrefFor(view.id, "learn", i).slice(1); };

/* ---------- learn view ---------- */
function renderLearn(){
  const m = byId(view.id), sc = SCENES[view.id];
  $("#stage").innerHTML = `
  <div class="lhead"><div class="erow"><span class="eyebrow">Lesson ${numOf(m.id)}</span><span class="eyebrow">≈ ${m.hours} h · ${sectionOf(m.id).name}</span></div>
    <h1>${m.title}</h1><p class="sub">${sc.sub}</p>
    <nav class="chips" aria-label="In this lesson">${sc.steps.map((s, j) => `<a class="chip" href="${hrefFor(m.id, "learn", j)}">${pad(j + 1)} · ${esc(s.t)}</a>`).join("")}</nav></div>
  <section class="model" aria-label="Animated model">
    <div class="model-top"><span class="live eyebrow"><i></i>Live model</span><span class="eyebrow" id="stepc"></span></div>
    <div class="metrics">${sc.metrics.map((l, j) => `<div><span class="ml">${l}</span><span class="mv" id="mv${j}">—</span></div>`).join("")}</div>
    <div class="canvas"><svg id="scene" viewBox="0 0 680 370" role="img" aria-label="Animated diagram for ${esc(m.title)}"></svg></div>
    <p class="inspect" id="inspect" aria-live="polite">Select a component to see its role.</p>
    <div class="controls">
      <button class="icon" id="prev" aria-label="Previous step">←</button>
      <button class="play" id="play" aria-pressed="false">▶ Play</button>
      <div class="timeline">${sc.steps.map((s, j) => `<button class="seg" data-step="${j}" aria-label="Step ${j + 1}: ${esc(s.t)}"><span><i></i></span></button>`).join("")}</div>
      <button class="icon" id="next" aria-label="Next step">→</button>
    </div>
  </section>
  <p class="fine">Teaching model: the numbers illustrate relationships. They aren't measurements of a real system. Use ← and → to move between steps.</p>`;
  buildScene(sc);
  setStep(view.step);
}
function setStep(i){
  const sc = SCENES[view.id], s = sc.steps[i], n = sc.steps.length;
  view.step = i;
  $("#stepc").textContent = `${pad(i + 1)} / ${pad(n)}`;
  s.m.forEach((v, j) => { const el = $("#mv" + j); if (el.textContent !== v) { el.textContent = v; el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); } });
  const act = s.e.map(([a, b]) => ({a, b, k:key(a, b)})), keys = new Set(act.map(x => x.k));
  document.querySelectorAll("#scene .flow").forEach(f => {
    const on = keys.has(f.dataset.f), was = f.classList.contains("on");
    f.classList.toggle("on", on);
    if (on && !was && !REDUCE) { const L = f.getTotalLength(); f.style.strokeDasharray = L; f.animate([{strokeDashoffset:L}, {strokeDashoffset:0}], {duration:700, easing:"ease-out"}); }
  });
  const warn = new Set(s.w || []), hot = new Set(s.h || act.flatMap(x => [x.a, x.b]));
  document.querySelectorAll("#scene .node").forEach(g => { const id = g.dataset.n; g.classList.toggle("warn", warn.has(id)); g.classList.toggle("hot", hot.has(id) && !warn.has(id)); });
  setPackets(act);
  document.querySelectorAll(".seg").forEach((b, j) => { b.classList.toggle("past", j < i); b.classList.toggle("cur", j === i); b.querySelector("i").style.width = ""; });
  $("#prev").disabled = i === 0; $("#next").disabled = i === n - 1;
  anim.segStart = performance.now();
  renderStepNotes(i);
  if ((state.seen[view.id] ?? -1) < i) { state.seen[view.id] = i; save(); }
  document.querySelectorAll(".chip").forEach((c, j) => { c.classList.toggle("on", j === i); c.classList.toggle("seen", j <= state.seen[view.id]); });
  refreshSide();
}
function renderStepNotes(i){
  const sc = SCENES[view.id], s = sc.steps[i], n = sc.steps.length, next = MODULES[MODULES.findIndex(m => m.id === view.id) + 1];
  $("#aside").innerHTML = `
  <div><div class="stepnum"><span class="big">${pad(i + 1)}</span><span class="eyebrow">/ Step<br>of ${pad(n)}</span></div>
    <div class="steptabs v">${sc.steps.map((x, j) => `<a href="${hrefFor(view.id, "learn", j)}" class="${j === i ? "on" : ""}" ${j === i ? 'aria-current="step"' : ""} title="${esc(x.t)}">${pad(j + 1)}</a>`).join("")}</div></div>
  <div class="fade">
    <h2>${esc(s.t)}</h2>
    <p class="sbody">${esc(s.b)}</p>
    <div class="think"><span class="eyebrow">Think about it</span><p>${esc(s.q)}</p></div>
    ${i === n - 1
      ? `<div class="donecard"><p><b>Lesson complete.</b> Read the notes, try the labs and build task, then check yourself with the quiz.</p>
         <div class="row"><a class="btn primary" href="${hrefFor(view.id, "practice")}">Practice</a><a class="btn" href="${hrefFor(view.id, "quiz")}">Quiz</a>${next ? `<a class="btn" href="#${next.id}">Next lesson →</a>` : ""}</div></div>`
      : `<button class="btn" id="next2" style="align-self:flex-start">Next: ${esc(sc.steps[i + 1].t)} →</button>`}
  </div>`;
}
/* ---------- home ---------- */
const SHORT = {m0:"Computers",ct:"Thinking",m1:"Python",m2:"Math",ai:"AI basics",data:"Data",ml:"Machine learning",dl:"Deep learning",m3:"LLMs",m4:"LLM apps",m6:"RAG",m7:"Agents",m8:"Evals & tuning",m9:"Production",m11:"Capstone"};
const GLY = {m0:">_",ct:"◇",m1:"py",m2:"cos",ai:"AI",data:"pd",ml:"f(x)",dl:"∇",m3:"▮▯",m4:"API",m6:"DB",m7:"fn",m8:"%",m9:"↑",m11:"✎"};
const HOME = {nodes:{}, edges:[]};
// snake across rows of at most 6: left→right, then right→left
const ROWS = Math.ceil(MODULES.length / 6), COLS = Math.ceil(MODULES.length / ROWS);
MODULES.forEach((m, i) => {
  const r = Math.floor(i / COLS), c = r % 2 ? COLS - 1 - i % COLS : i % COLS;
  HOME.nodes[m.id] = [75 + c * (530 / (COLS - 1)), ROWS > 1 ? 60 + r * (240 / (ROWS - 1)) : 185, GLY[m.id], SHORT[m.id], "Lesson " + pad(i + 1), m.title];
  if (i) HOME.edges.push([MODULES[i - 1].id, m.id]);
});
function renderHome(){
  const done = MODULES.filter(lessonDone).length, next = MODULES.find(m => !lessonDone(m)) || MODULES[0], started = Object.keys(state.seen).length > 0;
  const steps = Object.values(SCENES).reduce((a, s) => a + s.steps.length, 0), hours = MODULES.reduce((a, m) => a + m.hours, 0);
  $("#stage").innerHTML = `<div class="wide-in" style="max-width:none;gap:28px">
  <div class="hero">
    <span class="eyebrow">${MODULES.length} animated lessons · ${steps} steps · about ${hours} hours</span>
    <h1>Zero to AI Engineer</h1>
    <p class="lede">Learn to build real AI products, from your first Python script to retrieval, agents, evals and production. Every idea is a live diagram you can play, pause and inspect, followed by notes, hands-on labs, a portfolio build and a quiz.</p>
    ${done === MODULES.length
      ? `<div class="donecard"><p><b>Course complete.</b> You've worked through all ${MODULES.length} lessons. Ship your capstone, publish the write-up, and come back to any lesson from the map below.</p><div class="row"><button class="btn" id="browse">Browse lessons</button></div></div>`
      : `<div class="cta"><a class="btn primary" href="#${next.id}">${started ? "Continue" : "Start"} · Lesson ${numOf(next.id)}: ${next.title}</a><button class="btn" id="browse">Browse lessons</button><span class="meter-label">${done} / ${MODULES.length} completed</span></div>`}
  </div>
  <section class="model" aria-label="Course map">
    <div class="model-top"><span class="live eyebrow"><i></i>Course map</span><span class="eyebrow">Select a lesson to open it</span></div>
    <div class="canvas"><svg id="scene" class="map" viewBox="0 0 680 370" role="img" aria-label="Map of all ${MODULES.length} lessons"></svg></div>
  </section>
  <div class="feat">
    <div><h3>Watch</h3><p>Data moves, components light up and numbers change as you step through each system.</p></div>
    <div><h3>Read</h3><p>Concise notes with code you can run, plus links to go deeper.</p></div>
    <div><h3>Build</h3><p>Labs in the page and one portfolio project per lesson.</p></div>
    <div><h3>Check</h3><p>Quizzes that explain why each answer is right or wrong.</p></div>
  </div>
  ${SECTIONS.map((s, si) => `<section class="phase"><div class="phase-h"><h2>${s.name}</h2><span class="meter-label">${pad(si + 1)} · ${s.ids.reduce((a, id) => a + byId(id).hours, 0)} h</span></div>
    <div class="rows">${s.ids.map(id => { const m = byId(id), sc = SCENES[id], d = lessonDone(m), seen = state.seen[id] !== undefined;
      const qs = quizScore(m);
      return `<a class="lrow" href="#${id}"><span class="n">${numOf(id)}</span><span><b>${m.title}</b><span class="s">${sc.sub}</span></span><span class="lmeta">${sc.steps.length} steps · ${m.hours} h${qs.answered === qs.total ? ` · quiz ${qs.right}/${qs.total}` : ""}${d ? '<span class="pill yes">done</span>' : seen ? '<span class="pill" style="background:var(--accent-soft);color:var(--accent)">in progress</span>' : ""}</span></a>`; }).join("")}</div></section>`).join("")}
  </div>`;
  buildScene(HOME);
  document.querySelectorAll("#scene .node").forEach(g => { const m = byId(g.dataset.n); g.classList.toggle("hot", lessonDone(m)); g.classList.toggle("sel", m === next); g.setAttribute("aria-label", `Open lesson ${numOf(m.id)}: ${m.title}`); });
  document.querySelectorAll("#scene .flow").forEach(f => f.classList.toggle("on", f.dataset.f.split("|").every(id => state.seen[id] !== undefined)));
  // one long signal path through every lesson; dots slip behind the node boxes
  const g = $("#scene .packets"), path = document.createElementNS(SV, "path");
  path.setAttribute("d", "M" + Object.values(HOME.nodes).map(([x, y]) => x + " " + y).join(" L")); path.setAttribute("fill", "none"); g.append(path);
  anim.pk = [{p:path, len:path.getTotalLength(), rev:false, ofs:0, els:[0, 1, 2].map(() => {
    const h = document.createElementNS(SV, "circle"), c = document.createElementNS(SV, "circle");
    h.setAttribute("r", 9); h.setAttribute("class", "pkh"); c.setAttribute("r", 4); c.setAttribute("class", "pk"); g.append(h, c); return [h, c]; })}];
  drawPackets(REDUCE ? 0 : performance.now());
  $("#aside").innerHTML = "";
  refreshSide();
}

function inspect(nd){
  if (!view.id) { location.hash = nd.dataset.n; return; }
  const [, , , lab, , role] = SCENES[view.id].nodes[nd.dataset.n];
  document.querySelectorAll("#scene .node.sel").forEach(x => x.classList.remove("sel"));
  nd.classList.add("sel");
  $("#inspect").innerHTML = `<b>${esc(lab)}</b> · ${esc(role.trim())}`;
}

/* ---------- notes / practice / quiz ---------- */
function renderOther(){
  anim.pk = [];
  const m = byId(view.id), order = ["learn","notes","practice","quiz"], ti = order.indexOf(view.tab), nextL = MODULES[MODULES.indexOf(m) + 1];
  const names = {notes:"Notes", practice:"Practice", quiz:"Quiz"};
  let body = "";
  if (view.tab === "notes") body = m.lessons.map(l => `<article class="lesson"><h3>${l.t}</h3><div class="lesson-body">${l.b}</div></article>`).join("")
    + (m.res.length ? `<section class="section"><h2>Go deeper</h2><ul class="res">${m.res.map(([n, u]) => `<li>${u ? `<a href="${u}" target="_blank" rel="noopener">${n}</a>` : n}</li>`).join("")}</ul></section>` : "");
  if (view.tab === "practice") body = (m.lab || []).map(w => `<div class="lab" data-widget="${w}"></div>`).join("")
    + `<div class="build"><div class="lesson-top"><div><span class="eyebrow">Portfolio task</span><h3>${m.build.t}</h3></div><label class="check"><input type="checkbox" data-key="${m.id}-build" ${state.done[m.id + "-build"] ? "checked" : ""}>Built it</label></div><ul>${m.build.items.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  if (view.tab === "quiz") body = m.quiz.map((q, j) => quizHTML(m.id + "-q" + j, q)).join("");
  const nextHref = ti < 3 ? hrefFor(m.id, order[ti + 1]) : nextL ? "#" + nextL.id : null;
  const nextLabel = ti < 3 ? (order[ti + 1] === "notes" ? "Notes" : names[order[ti + 1]]) : nextL ? nextL.title : "";
  $("#stage").innerHTML = `<div class="wide-in">
    <div class="lhead"><div class="erow"><span class="eyebrow">Lesson ${numOf(m.id)} · ${names[view.tab]}</span><span class="eyebrow">≈ ${m.hours} h · ${sectionOf(m.id).name}</span></div><h1>${m.title}</h1><p class="sub">${m.why}</p></div>
    <div class="section">${body}</div>
    <nav class="pager"><a class="btn" href="${hrefFor(m.id, order[ti - 1])}">← ${ti - 1 === 0 ? "Animated lesson" : names[order[ti - 1]]}</a>${nextHref ? `<a class="btn primary" href="${nextHref}">${esc(nextLabel)} →</a>` : ""}</nav></div>`;
  $("#aside").innerHTML = "";
  document.querySelectorAll("[data-widget]").forEach(el => WIDGETS[el.dataset.widget](el));
}
function quizHTML(k, q){
  const pick = state.quiz[k], answered = pick !== undefined;
  return `<div class="q"><p class="q-text">${q.q}</p><div class="opts">${q.o.map((o, i) =>
    `<button class="opt ${answered ? (i === q.a ? "right" : i === pick ? "wrong" : "") : ""}" data-q="${k}" data-i="${i}" ${answered ? "disabled" : ""}>${o}</button>`).join("")}</div>
    ${answered ? `<p class="explain">${pick === q.a ? "Correct. " : "Not quite. "}${q.w}</p><button class="btn small" data-retry="${k}" style="align-self:flex-start">Try again</button>` : ""}</div>`;
}
const findQuiz = k => { const [mid, qi] = k.split("-q"); return byId(mid).quiz[+qi]; };

/* ---------- routing & events ---------- */
function parse(){
  const r = location.hash.slice(1).match(/^([a-z][a-z0-9]*)(?:-(s[1-9]|notes|practice|quiz))?$/);
  if (!r || !byId(r[1])) return {id:null, tab:"home", step:0};
  const t = r[2], step = t && t[0] === "s" ? +t.slice(1) - 1 : 0;
  return {id:r[1], tab:!t || t[0] === "s" ? "learn" : t, step:Math.min(step, SCENES[r[1]].steps.length - 1)};
}
function route(){
  const v = parse(), same = v.id === view.id && v.tab === "learn" && view.tab === "learn";
  view = v;
  if (same) setStep(v.step);
  else {
    if (anim.playing) setPlaying(false);
    $("#app").classList.toggle("wide", v.tab !== "learn");
    v.tab === "home" ? renderHome() : v.tab === "learn" ? renderLearn() : (renderOther(), refreshSide());
    window.scrollTo(0, 0);
  }
  renderTabs(); closeMenu();
  document.title = v.id ? `${byId(v.id).title} · Zero to AI Engineer` : "Zero to AI Engineer";
}
window.addEventListener("hashchange", route);

document.addEventListener("click", e => {
  const nd = e.target.closest("#scene .node"); if (nd) return inspect(nd);
  const b = e.target.closest("button"); if (!b) return;
  if (b.id === "prev") go(view.step - 1);
  else if (b.id === "next" || b.id === "next2") go(view.step + 1);
  else if (b.id === "play") setPlaying(!anim.playing);
  else if (b.id === "browse") openMenu();
  else if (b.dataset.step !== undefined) go(+b.dataset.step);
  else if (b.dataset.q) { state.quiz[b.dataset.q] = +b.dataset.i; save(); b.closest(".q").outerHTML = quizHTML(b.dataset.q, findQuiz(b.dataset.q)); renderTabs(); }
  else if (b.dataset.retry) { delete state.quiz[b.dataset.retry]; save(); b.closest(".q").outerHTML = quizHTML(b.dataset.retry, findQuiz(b.dataset.retry)); renderTabs(); }
  else if (b.id === "reset") $("#reset-zone").innerHTML = `<span class="row">Clear all progress? <button class="btn small" id="reset-yes">Clear</button><button class="btn small" id="reset-no">Keep</button></span>`;
  else if (b.id === "reset-yes" || b.id === "reset-no") {
    if (b.id === "reset-yes") { state = {seen:{}, done:{}, quiz:{}}; save(); view = {id:null}; route(); }
    $("#reset-zone").innerHTML = `<button class="btn small" id="reset">Reset progress</button>`; refreshSide();
  }
});
document.addEventListener("change", e => {
  const k = e.target.dataset && e.target.dataset.key; if (!k) return;
  if (e.target.checked) state.done[k] = true; else delete state.done[k];
  save();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && side.classList.contains("open")) return closeMenu();
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (typing) return;
  const nd = e.target.closest && e.target.closest("#scene .node");
  if (nd && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); return inspect(nd); }
  if (e.key === "/") { e.preventDefault(); openMenu(); return; }
  if (view.tab !== "learn") return;
  const n = SCENES[view.id].steps.length;
  if (e.key === "ArrowRight" && view.step < n - 1) go(view.step + 1);
  if (e.key === "ArrowLeft" && view.step > 0) go(view.step - 1);
});

route();
requestAnimationFrame(frame);

/* self-check: every scene edge and step references real nodes and edges */
console.assert(MODULES.every(m => SCENES[m.id]) && SECTIONS.flatMap(s => s.ids).length === MODULES.length, "scene per module");
Object.entries(SCENES).forEach(([id, sc]) => {
  const ks = new Set(sc.edges.map(([a, b]) => key(a, b)));
  sc.edges.forEach(([a, b]) => console.assert(sc.nodes[a] && sc.nodes[b], `${id}: edge ${a}-${b} has a missing node`));
  sc.steps.forEach((s, i) => {
    s.e.forEach(([a, b]) => console.assert(ks.has(key(a, b)), `${id} step ${i + 1}: edge ${a}-${b} not drawn`));
    (s.h || []).concat(s.w || []).forEach(n => console.assert(sc.nodes[n], `${id} step ${i + 1}: node ${n} missing`));
    console.assert(s.m.length === sc.metrics.length, `${id} step ${i + 1}: metric count`);
  });
});
console.assert(Math.abs(softmax([3.2, 2.5, -0.5], 1).reduce((a, b) => a + b) - 1) < 1e-9 && softmax([1, 5, 2], 0)[1] === 1, "softmax");
console.assert(Math.abs(cosine([2, 0], [5, 0]) - 1) < 1e-9, "cosine");
