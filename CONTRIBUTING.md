# Contributing

Corrections, clearer explanations, new labs and translations are welcome. Open an issue to discuss bigger changes first. Keep the writing plain and specific, and run the content check before opening a pull request. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Run it locally

There is no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

## How it's organised

```
index.html                  page shell
assets/player.css           styles (dark and light themes)
assets/player.js            routing, animated diagrams, labs, quizzes, progress
content/course.js           all lesson content: edit this to change or add lessons
docs/                       the full program outline
scripts/check-content.mjs   checks the content for broken diagrams
```

## Edit or add a lesson

Lesson content lives in `content/course.js`:

- `MODULES`: each lesson's title, hours, notes (`lessons`), build task (`build`), quiz and further reading (`res`). The optional `lab` lists which interactive labs to show, by name: `tokens`, `temp`, `vectors`, `cost`, `prompt`, `rag`, `agent`. Labs are written in `assets/player.js`.
- `SCENES`: each lesson's animated diagram.
  - `nodes`: `id: [x, y, glyph, label, sublabel, role]` on a 680 × 370 canvas. `role` is shown when someone clicks the node.
  - `edges`: `[from, to, label?]` connections.
  - `metrics`: the four numbers shown above the diagram.
  - `steps`: `{t, b, q, e, m, h?, w?}`. That's the title, body, "think about it" question, the edges data flows along (`[[from, to], …]`), the four metric values, and optional highlighted (`h`) or warning (`w`) nodes.
- `PAYLOAD`: the label carried by the moving data in each step.
- `SECTIONS`: which lessons belong to which level, in order. Keep `MODULES` in the same order.

Lesson ids (`m0`, `ct`, `m1` …) are the keys learners' progress is saved under, so don't rename existing ones. A new lesson also needs a short label and glyph in `SHORT` and `GLY` in `assets/player.js` for the course map.

## Check your changes

```bash
node scripts/check-content.mjs
```

It reports any step that points at a missing node or edge, the wrong number of metrics, a step missing its title, body or question, a lesson missing from `SECTIONS`, a `PAYLOAD` with the wrong number of labels, or an out-of-range quiz answer.

## Publish your own copy

The site is static, so any static host works. On GitHub: Settings → Pages → deploy from the `main` branch, root folder.
