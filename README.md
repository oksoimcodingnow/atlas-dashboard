# ATLAS Dashboard

A personal AI-style startup dashboard for Visual Studio Code. Auto-opens when you launch VSCode and greets you with a Jarvis/Iron-Man inspired HUD — clock, sprint counter, quick actions, and a daily quote.

Built as a personal productivity tool to make my dev workflow feel a little more like Tony Stark's lab.

## Features

- **Auto-launch** on VSCode startup (configurable)
- **Time-aware greeting** — morning / afternoon / evening / late night
- **Live HUD** — clock, date, session ID, current sprint day
- **Quick actions** with keyboard shortcuts (`1`–`6`):
  - Start Claude
  - Open Terminal
  - New File
  - Open Folder
  - Quick Open
  - Go to Symbol
- **Rotating quotes** in the footer for daily motivation
- **Configurable user name** in the greeting

## Stack

- VSCode Extension API (CommonJS)
- Plain HTML / CSS / JS (no framework — fast load, no build step)
- Webview Panel API for the dashboard UI

## Install (local)

```bash
git clone https://github.com/Paphangkorn-Onrueang/atlas-dashboard.git
cd atlas-dashboard
npx --yes @vscode/vsce package --allow-missing-repository --skip-license
code --install-extension atlas-dashboard-*.vsix
```

Then reload VSCode — ATLAS will open automatically.

To open manually: `Ctrl+Shift+P` → **ATLAS: Open Dashboard**.

## Configuration

In VSCode settings:

| Setting | Default | Description |
|---|---|---|
| `atlas.openOnStartup` | `true` | Auto-open dashboard when VSCode starts |
| `atlas.userName` | `Protocol` | Name shown in the greeting |

## Why I built this

I wanted my coding environment to feel intentional — every time I open VSCode, I see a clear "what are we building today?" prompt instead of a blank workspace. It's a small psychological nudge that helps me focus during focused work sessions.

---

Built by [Paphangkorn Onrueang](https://github.com/Paphangkorn-Onrueang) — Financial Engineering student exploring software/AI tooling.
