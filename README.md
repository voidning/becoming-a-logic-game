# Becoming

English · [简体中文](README.zh-CN.md)

A minimalist browser puzzle with three levels: First Encounter, Recovery, and Remainder. Place material, recover it, and reuse it to guide a dot to its destination. The game ends after the third level and can be replayed.

The first completion unlocks removal. The final completion reveals the name “变” as a closing reward; this package defines no playable action for that name. Philosophical names are game metaphors, not definitions of Hegel's concepts.

## Play locally

Open [`becoming.html`](becoming.html) directly for the portable single-file build. It contains the same three-level game as `site/` and needs no server, build step, dependencies, or network access.

To run the source version through a local server:

```sh
python3 tools/serve.py --open
```

Use `--level 3` to open the third level. Valid levels are 1–3. Keep the terminal running; Ctrl+C stops the server. On macOS, double-click `启动试玩.command`. The editable source remains in `site/`.

Choose placement with 1 or removal with 2, then click a slot or material. The dot walks automatically. Its current support cannot be removed. Escape restarts the current level. Progress stores level numbers, not unfinished layouts.

## Handoff and checks

Read [START_HERE](START_HERE.md), [gameplay](docs/GAMEPLAY.md), [technical notes](docs/TECHNICAL_HANDOFF.md), and [design principles](docs/DESIGN_DIRECTION.md). Documentation and interface are in Chinese. `site/` contains the current three-level source; `archives/` contains an earlier blank experiment and a two-level prototype.

```sh
node tools/check-rules.cjs
node tools/check-controller.cjs
python3 tools/build-standalone.py --check
python3 tools/check-integrity.py
```

The rule check covers 91 reachable states. The mocked controller check covers the three-level journey, final reward, completion, saved progress, and replay. These checks are not real-browser E2E or evidence of philosophical understanding. See [validation](validation/RESULTS.md).

After changing `site/index.html`, `site/puzzle.js`, or `site/app.js`, rebuild the portable file with `python3 tools/build-standalone.py`.
