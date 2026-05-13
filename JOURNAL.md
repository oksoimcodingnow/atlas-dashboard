# ATLAS Dashboard — Project Journal

> A VSCode extension that opens a Jarvis-style dashboard when VSCode launches.
> Written for my own reference — no coding experience assumed.

---

## What is ATLAS Dashboard?

A VSCode extension I built that auto-opens a HUD when I launch VSCode. Instead of staring at a blank editor, I see:

- A greeting that adjusts to the time of day
- Live clock, date, sprint counter
- Quick action buttons (Live Server, Terminal, Git, etc.)
- My recent projects (one-click open)
- My open journal todos (reads JOURNAL.md `- [ ]` items)
- Custom external links (Firebase Console, live shop, GitHub, whatever)
- **Built-in AI chat** with Claude and free Gemini — streaming, with a model picker

Companion app: **[ATLAS Mobile](https://github.com/oksoimcodingnow/atlas-mobile)** — same vibe but lives in my phone home screen as a PWA.

---

## Project Files

| File | What it does |
|------|-------------|
| `package.json` | Extension manifest (name, commands, settings schema, dependencies) |
| `extension.js` | The Node.js code — registers commands, opens the webview, handles chat |
| `webview/index.html` | The actual HUD UI — one self-contained HTML file with CSS + JS inside |
| `USING_ATLAS.md` | End-user usage walkthrough (settings, troubleshooting, examples) |
| `README.md` | The GitHub repo description |
| `CLAUDE.md` | Briefing for AI coding agents working on this repo |

---

## How to Install Locally

> **Important:** You need Node.js 18+ and VSCode installed.

1. Clone the repo:
   ```bash
   git clone https://github.com/oksoimcodingnow/atlas-dashboard.git
   cd atlas-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Package the extension into a `.vsix` file:
   ```bash
   npx @vscode/vsce package --allow-missing-repository --skip-license
   ```
4. Install the package into VSCode:
   ```bash
   code --install-extension atlas-dashboard-*.vsix --force
   ```
5. Reload VSCode (`Ctrl+Shift+P` → "Reload Window") → ATLAS opens automatically.

### Does it work on both my PCs?
**Yes** — clone the repo on each PC, run the same install commands, done. API keys are stored per-machine in VSCode's SecretStorage (not in code, not synced).

---

## Tech Stack

| Tool | What it's for |
|------|--------------|
| VSCode Extension API | The platform — gives us commands, webviews, secret storage |
| Plain HTML/CSS/JS (no framework) | The webview UI — fast, no build step, easy to edit |
| Node.js (CommonJS) | The extension code itself (`extension.js`) |
| Anthropic SDK | Claude chat (Opus 4.7, Sonnet 4.6, Haiku 4.5) |
| Google GenAI SDK | Gemini chat (FREE 2.5 Flash) |
| `@vscode/vsce` | Packages the extension into a `.vsix` file for install |
| GitHub | Version control |

---

## Configuration

All settings live under `atlas.*` in VSCode settings. Open them via:
- The ⚙ SETTINGS button in the ATLAS header, OR
- `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)" → search `atlas.`

### Settings reference

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `atlas.openOnStartup` | boolean | `true` | Auto-open ATLAS when VSCode launches |
| `atlas.userName` | string | `"Protocol"` | Name shown in the greeting |
| `atlas.sprintStartDate` | string | `""` | `YYYY-MM-DD` — empty hides sprint counter |
| `atlas.sprintLength` | number | `3` | Sprint length in days |
| `atlas.journalPath` | string | `"JOURNAL.md"` | Path to journal file for the todos widget |
| `atlas.projects` | array | `[]` | `[{name, path}]` for the Projects panel |
| `atlas.links` | array | `[]` | `[{name, url}]` for the Links panel |
| `atlas.model` | enum | `"gemini-2.5-flash"` | AI model used by the chat |
| `atlas.systemPrompt` | string | (long Jarvis-y prompt) | ATLAS's personality |
| `atlas.maxTokens` | number | `2048` | Max output tokens per chat response |

### API Keys (stored securely, NOT in settings)

| Command | Stores | Where to get |
|---------|--------|--------------|
| `ATLAS: Set Gemini API Key (free)` | `atlas.geminiApiKey` | https://aistudio.google.com/apikey (free) |
| `ATLAS: Set Anthropic API Key` | `atlas.anthropicApiKey` | https://console.anthropic.com (paid) |

Both go into VSCode's **SecretStorage** — encrypted, never in plaintext settings.

---

## The Chat Flow

When I type a message in the chat panel and hit Enter:

1. The webview sends `{command: "chat", messages, model, turnId}` to `extension.js`
2. `extension.js` checks which model I picked:
   - `gemini-*` → uses Google GenAI SDK
   - `claude-*` → uses Anthropic SDK
3. The right SDK streams text deltas back as `{command: "chatDelta", text, turnId}` events
4. The webview appends each delta to the current bubble in real-time
5. On `chatDone` → the bubble freezes and history saves for the next turn

Both providers respect the same system prompt + message format on the way in, and produce the same SSE event shape on the way out. The webview doesn't know which AI answered.

---

## Big Things We Built / Changed

### v0.0.1 — JARVIS Dashboard (first scaffold)
- Quick scaffold with greeting circle, clock, quick actions
- No chat yet — just the HUD

### v0.0.2-0.0.3 — Renamed Jarvis → ATLAS
- Picked ATLAS as the codename
- Switched greeting label to "Protocol" (my preferred name in chat)
- Cleaned up Tony Stark quotes (cosmetic theater)

### v0.0.4 — Real productivity features
- Added Projects panel (one-click open my repos)
- Added Journal Todos widget (reads `- [ ]` from JOURNAL.md)
- Added Links panel (Firebase Console, live shop URLs, GitHub)
- Sprint counter that actually calculates from a start date

### v0.0.5 — Built-in Claude AI chat
- Streaming chat panel below the other panels
- API key stored in SecretStorage (secure)
- Configurable system prompt for ATLAS's personality

### v0.0.6 — Inline model picker (the "slicer")
- Pill buttons in the chat header: OPUS / SONNET / HAIKU
- Click to switch model on the fly, no settings dive needed
- Selection persists to `atlas.model` setting

### v0.0.7 — Trim cosmetic theater
- Removed fake SESSION counter (was just `Date.now() % 9999`)
- Removed LOCATION row (static text that goes stale)
- Removed rotating quotes
- Cleaner status panel: DATE / TIME / SPRINT / WORKSPACE

### v0.0.8 — Free Gemini support
- Added Google Gemini 2.5 Flash (FREE — 1500 chats/day)
- Refactored chat handler to route by model prefix (gemini vs claude)
- New default model: GEMINI (free)
- Slicer reordered cheapest → most expensive: GEMINI / HAIKU / SONNET / OPUS
- Two API key commands now: Anthropic + Gemini (independent)

---

## Bugs We Fixed Along the Way

| Bug | What happened | Fix |
|-----|--------------|-----|
| Extension wasn't installing | `code --list-extensions` failed because Windows `code` resolved to GUI binary, not CLI | Used the full path `C:\...\Microsoft VS Code\bin\code.cmd` |
| Editor kept suggesting "convert to ES module" | Style hint from TypeScript language server | Just ignore — CommonJS is correct for VSCode extensions |
| GitHub push failed | Cached old `Paphangkorn-Onrueang` credentials | Cleared via `cmdkey /delete:git:https://github.com` + Git Credential Manager re-auth |
| `vsce package` complained about README link | `USING_ATLAS.md` relative link needed repo URL | Added `repository` field to package.json |

---

## To-Do List

- [x] Auto-open on VSCode startup
- [x] Time-aware greeting + sprint counter
- [x] Projects / Journal Todos / Links panels
- [x] Built-in streaming chat with Claude
- [x] Inline model picker slicer
- [x] Free Gemini support (zero-cost daily chat)
- [ ] Google Calendar OAuth + push notifications for class/work schedule
- [ ] Voice input + TTS output ("Jarvis voice")
- [ ] Markdown rendering in chat (code blocks, syntax highlighting)
- [ ] Persistent chat history per workspace
- [ ] Add OpenAI GPT-5 / GPT-4o to the slicer
- [ ] Auto-detect and offer to install Live Server if missing

---

## Useful Links

| What | URL |
|------|-----|
| GitHub repo | https://github.com/oksoimcodingnow/atlas-dashboard |
| Sister project (mobile) | https://github.com/oksoimcodingnow/atlas-mobile |
| Live mobile app | https://atlas-mobile-theta.vercel.app |
| Anthropic console | https://console.anthropic.com |
| Gemini API keys | https://aistudio.google.com/apikey |
| GitHub PAT settings | https://github.com/settings/tokens |
| VSCode extension docs | https://code.visualstudio.com/api |
