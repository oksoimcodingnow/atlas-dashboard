# USING ATLAS — Your Personal VSCode HUD

> Friendly walkthrough — no coding experience assumed.
> Written in the JOURNAL style: tables, checklists, plain English.

---

## What is ATLAS?

ATLAS is a VSCode extension that opens a Jarvis-style dashboard every time you launch VSCode. Instead of staring at an empty editor, you see:

- A greeting with your name and the time of day
- A live clock, today's date, and a sprint counter
- One-click buttons for the things you do most (Start Claude, Live Server, Terminal…)
- Your **Projects** — open any of your repos in one click
- **Journal Todos** — the unchecked items from your `JOURNAL.md` show up live
- **Links** — Firebase Console, live shop URL, GitHub repo… whatever you visit a lot

It's a small psychological nudge: every session starts with **"what are we building today?"** instead of a blank screen.

---

## First-Time Setup

| Step | What to do |
|------|-----------|
| 1 | The extension is already installed if you cloned this repo and ran `code --install-extension atlas-dashboard-*.vsix` |
| 2 | Press `Ctrl+Shift+P` → type **Reload Window** → enter |
| 3 | ATLAS should pop open automatically |
| 4 | If it doesn't: `Ctrl+Shift+P` → **ATLAS: Open Dashboard** |

To open settings: click the **⚙ SETTINGS** button in the header (top-right).

---

## Settings — Make ATLAS Yours

All settings live under `atlas.*` in your VSCode settings. You can edit them in three places:

- **UI**: click the ⚙ gear in ATLAS's header
- **JSON**: `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
- **Per-project**: edit `.vscode/settings.json` inside any project folder

### All available settings

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `atlas.openOnStartup` | boolean | `true` | Auto-open ATLAS when VSCode starts |
| `atlas.userName` | string | `"Protocol"` | Name shown under the greeting circle |
| `atlas.location` | string | `"URBAN"` | Label in the LOCATION row |
| `atlas.sprintStartDate` | string | `""` | `YYYY-MM-DD` when sprint began. Empty = hides counter |
| `atlas.sprintLength` | number | `3` | How many days the sprint runs |
| `atlas.journalPath` | string | `"JOURNAL.md"` | Where the Todos widget looks (relative to workspace) |
| `atlas.projects` | array | `[]` | Quick-open project list (see below) |
| `atlas.links` | array | `[]` | External links (see below) |

### Example settings.json

```json
{
  "atlas.userName": "Protocol",
  "atlas.location": "URBAN",
  "atlas.sprintStartDate": "2026-05-13",
  "atlas.sprintLength": 3,
  "atlas.projects": [
    { "name": "Roshop",   "path": "C:/Users/hzdjd/Downloads/roshop" },
    { "name": "Atlas",    "path": "C:/Users/hzdjd/Downloads/Atlas-dashboard" },
    { "name": "Flask",    "path": "C:/Users/hzdjd/Downloads/flask_test" }
  ],
  "atlas.links": [
    { "name": "Roshop live",       "url": "https://roshop-642dd.web.app" },
    { "name": "Roshop admin",      "url": "https://roshop-642dd.web.app/admin.html" },
    { "name": "Firebase Console",  "url": "https://console.firebase.google.com" },
    { "name": "GitHub — roshop",   "url": "https://github.com/oksoimcodingnow/roshop" },
    { "name": "GitHub — atlas",    "url": "https://github.com/oksoimcodingnow/atlas-dashboard" }
  ]
}
```

> Tip: forward slashes (`/`) work in Windows paths in JSON. Easier than escaping backslashes.

---

## The Journal Todos Widget

If the current project has a `JOURNAL.md`, ATLAS reads it and shows your open todos.

It looks for lines like:
```
- [ ] Build the spin wheel        ← open todo (shows up)
- [x] Add login system            ← done (shows with strike-through)
```

**Hierarchy:**

| You write… | ATLAS shows it as |
|-----------|-------------------|
| `- [ ] AI item images` | Open — empty checkbox |
| `- [x] Custom domain` | Done — checkmark, struck through |
| plain bullet `- thing` | Ignored |

The widget loads once when the dashboard opens. Edit your journal, then **ATLAS: Reload Dashboard** to refresh.

---

## Keyboard Shortcuts

When the dashboard is focused, the number keys trigger Quick Actions:

| Key | Action |
|-----|--------|
| `1` | Start Claude |
| `2` | Go Live (Live Server) |
| `3` | Open Terminal |
| `4` | Quick Open file |
| `5` | New File |
| `6` | Source Control panel |

---

## Per-Workspace Customization

You probably want different links/projects per project. Use `.vscode/settings.json` inside a workspace:

**`Roshop/.vscode/settings.json`:**
```json
{
  "atlas.location": "ROSHOP",
  "atlas.links": [
    { "name": "Live site",   "url": "https://roshop-642dd.web.app" },
    { "name": "Admin panel", "url": "https://roshop-642dd.web.app/admin.html" },
    { "name": "Firebase",    "url": "https://console.firebase.google.com/project/roshop-642dd" }
  ]
}
```

These override your user settings when this workspace is open.

---

## Troubleshooting

| Problem | Try this |
|---------|---------|
| ATLAS didn't open | `Ctrl+Shift+P` → **Reload Window** |
| "Live Server extension not installed" | Install the **Live Server** extension by Ritwick Dey |
| Journal Todos says "not found" | Create a `JOURNAL.md` in the workspace root, or set `atlas.journalPath` |
| Project button does nothing | Check the path in settings — it must be a real folder |
| Want ATLAS off | Set `atlas.openOnStartup` to `false` |

---

## What's Next (Ideas)

- [ ] Save the last project you opened from ATLAS
- [ ] Show git branch + uncommitted changes count in Status
- [ ] Pull the current weather into the HUD
- [ ] Voice greeting on startup (because Jarvis)
- [ ] Theme picker — red/gold (Iron Man), green (Hulk), etc.

---

Made by [oksoimcodingnow](https://github.com/oksoimcodingnow) — Y3 Financial Engineering, building tools that make coding feel intentional.
