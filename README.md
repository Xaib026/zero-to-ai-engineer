# Zero to AI Engineer

A free, open-source course that takes you from zero to AI engineer in 15 animated lessons (about 600 hours of study).

Every idea is a live diagram you can play, pause and inspect: requests travel between components, the parts that matter light up, and the numbers change as you step through. Each lesson also has notes with runnable code, a portfolio build task and a quiz, and most have hands-on labs.

The lessons follow the [Professional AI Engineer program outline](docs/professional-program-outline.md) one to one: the same 15 modules, levels and hours.

| Level | Lessons |
| --- | --- |
| Foundation | Computer and technology fundamentals · Computational thinking · Python · Mathematics and statistics |
| Core AI | AI fundamentals · Data analysis · Machine learning · Deep learning |
| Applied AI | Generative AI and LLMs · Prompting and LLM apps · RAG and vector databases · AI agents |
| Professional | Evaluation, security and fine-tuning · Production and MLOps · Capstone and career |

No account, no build step, no tracking. Progress is saved in your own browser.

## Run it

Open `index.html` in a browser. Or serve the folder:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

## How it's organised

```
index.html            page shell
assets/player.css     styles (dark and light themes)
assets/player.js      routing, animated diagrams, labs, quizzes, progress
content/course.js     all lesson content: edit this to change or add lessons
scripts/check-content.mjs   checks the content for broken diagrams
```

## Edit or add a lesson

All content lives in `content/course.js`:

- `MODULES`: each lesson's title, notes (`lessons`), labs, build task, quiz and further reading.
- `SCENES`: each lesson's animated diagram.
  - `nodes`: `id: [x, y, glyph, label, sublabel, role]` on a 680 × 370 canvas. `role` is shown when someone clicks the node.
  - `edges`: `[from, to, label?]` connections.
  - `metrics`: the four numbers shown above the diagram.
  - `steps`: `{t, b, q, e, m, h?, w?}`. That's the title, body, "think about it" question, the edges data flows along (`[[from, to], …]`), the four metric values, and optional highlighted (`h`) or warning (`w`) nodes.
- `PAYLOAD`: the label carried by the moving data in each step.
- `SECTIONS`: which lessons belong to which level, in order. Keep `MODULES` in the same order.

Lesson ids (`m0`, `ct`, `m1` …) are the keys learners' progress is saved under, so don't rename existing ones. A new lesson also needs a short label and glyph in `SHORT` and `GLY` in `assets/player.js` for the course map.

After editing, run:

```bash
node scripts/check-content.mjs
```

It reports any step that points at a missing node or edge, the wrong number of metrics, or an out-of-range quiz answer.

## Contributing

Corrections, clearer explanations, new labs and translations are welcome. Open an issue to discuss bigger changes first. Keep the writing plain and specific, and run the content check before opening a pull request.

## Publish your own copy

The site is static, so any static host works. On GitHub: Settings → Pages → deploy from the `main` branch, root folder.

## License

[MIT](LICENSE)
