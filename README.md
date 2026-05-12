# ATLAS Dashboard

A personal AI-style startup dashboard for Visual Studio Code. Auto-opens when you launch VSCode and greets you with a Jarvis/Iron-Man inspired HUD — clock, sprint counter, quick actions, project launcher, and a live journal-todos widget.

Built as a personal productivity tool to make my dev workflow feel a little more like Tony Stark's lab.

> 📖 **[Full usage guide → USING_ATLAS.md](USING_ATLAS.md)**

![Status: live](https://img.shields.io/badge/status-live-00e5ff) ![VSCode](https://img.shields.io/badge/VSCode-1.80%2B-blue)

## Features

- 🚀 **Auto-launch** on VSCode startup (configurable)
- 👋 **Time-aware greeting** — morning / afternoon / evening / late night
- ⏱️ **Live HUD** — clock, date, session ID, sprint day-counter
- 🎯 **Quick actions** (keyboard shortcuts `1`–`6`):
  - Start Claude · Live Server · Terminal · Quick Open · New File · Source Control
- 📁 **Projects panel** — one-click open any folder you configure
- 📓 **Journal Todos** — reads `- [ ]` items from your `JOURNAL.md` and shows what's left
- 🔗 **Links panel** — Firebase Console, live site URLs, GitHub repos
- 🤖 **Built-in Claude AI chat** — talk to ATLAS, streaming responses, bring your own Anthropic API key
- ⚙ **Per-workspace customization** via `.vscode/settings.json`

## Stack

- VSCode Extension API (CommonJS)
- Plain HTML / CSS / JS (no framework — fast load, no build step)
- Webview Panel API for the dashboard UI

## Install (local)

```bash
git clone https://github.com/oksoimcodingnow/atlas-dashboard.git
cd atlas-dashboard
npx --yes @vscode/vsce package --allow-missing-repository --skip-license
code --install-extension atlas-dashboard-*.vsix
```

Then reload VSCode — ATLAS will open automatically. To open manually: `Ctrl+Shift+P` → **ATLAS: Open Dashboard**.

## Configuration

All settings live under `atlas.*`. Click the **⚙ SETTINGS** gear in the dashboard header to jump there directly.

| Setting | Default | Description |
|---|---|---|
| `atlas.openOnStartup` | `true` | Auto-open dashboard when VSCode starts |
| `atlas.userName` | `Protocol` | Name shown in the greeting |
| `atlas.location` | `URBAN` | Location label in the status panel |
| `atlas.sprintStartDate` | `""` | ISO date — empty hides the counter |
| `atlas.sprintLength` | `3` | Sprint length in days |
| `atlas.journalPath` | `JOURNAL.md` | Path to the markdown file for the Todos widget |
| `atlas.projects` | `[]` | `[{ "name", "path" }]` — Quick-open project list |
| `atlas.links` | `[]` | `[{ "name", "url" }]` — External links panel |

See **[USING_ATLAS.md](USING_ATLAS.md)** for examples and per-workspace setup.

## Why I built this

I wanted my coding environment to feel intentional — every time I open VSCode, I see a clear "what are we building today?" prompt instead of a blank workspace. It's a small psychological nudge that helps me focus during focused work sessions.

---

Built by [oksoimcodingnow](https://github.com/oksoimcodingnow) — 3rd-year Financial Engineering student exploring software/AI tooling.
