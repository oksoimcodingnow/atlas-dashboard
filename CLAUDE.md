# CLAUDE.md — ATLAS Dashboard (VSCode extension)

> Briefing for AI coding agents working on this repo.

## What this is

A VSCode extension that opens a Jarvis-style HUD when VSCode launches. Features:
- Time-aware greeting + sprint counter
- Quick action buttons (Live Server, Terminal, etc.)
- Recent projects launcher
- Journal todos widget (reads `- [ ]` checkboxes from `JOURNAL.md`)
- Configurable external links
- **Built-in AI chat** with Claude + free Gemini, streaming, model picker pills

**Companion repo:** https://github.com/oksoimcodingnow/atlas-mobile (mobile PWA version)

## User profile

- Y3 Financial Engineering student, GitHub `oksoimcodingnow`
- Prefers vanilla web stack (no frameworks beyond what's needed)
- Casual conversational style; values honest trade-offs
- Uses ATLAS daily during dev work

## Stack

- **VSCode Extension API** (CommonJS — the IDE hints "convert to ESM" — **ignore it**, CommonJS is correct here)
- **Plain HTML/CSS/JS** for the webview (no React, no build step)
- **Anthropic SDK** (`@anthropic-ai/sdk`) for Claude
- **Google GenAI SDK** (`@google/genai`) for Gemini (free)
- Distributed as `.vsix` package (built via `@vscode/vsce`)

## Architecture

```
extension.js  ← runs in VSCode's Node.js extension host
   ├── registers commands (atlas.openDashboard, atlas.setApiKey, etc.)
   ├── creates a WebviewPanel showing webview/index.html
   ├── handles messages from the webview (chat, openFile, runCommand, etc.)
   └── stores API keys in VSCode SecretStorage (NOT settings — secure)

webview/index.html  ← the actual HUD UI
   ├── self-contained: HTML + CSS + JS in one file (no build step)
   ├── reads __ATLAS_CONFIG__ placeholder injected by extension.js
   ├── posts messages to extension.js for actions
   └── displays streaming chat + tool events
```

## How chat works

User types → webview posts `{command: "chat", messages, model, turnId}` →
extension.js `handleChat()` routes by model name prefix:
- `gemini-*` → `chatGemini()` using `@google/genai`
- `claude-*` → `chatAnthropic()` using `@anthropic-ai/sdk`

Both stream text chunks back as `{command: "chatDelta", text, turnId}` events.

## Required secrets (stored in VSCode SecretStorage)

| Secret key | Set via command | Where to get |
|-----------|----------------|--------------|
| `atlas.geminiApiKey` | `ATLAS: Set Gemini API Key (free)` | https://aistudio.google.com/apikey |
| `atlas.anthropicApiKey` | `ATLAS: Set Anthropic API Key` | https://console.anthropic.com |

## Build + install workflow

```bash
cd Atlas-dashboard
npm install
npx @vscode/vsce package --allow-missing-repository --skip-license
code --install-extension atlas-dashboard-*.vsix --force
# Then reload VSCode window (Ctrl+Shift+P → Reload Window)
```

On Windows, `code` may need full path: `"C:\Users\<you>\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"`

## Conventions

- **CommonJS only** in `extension.js`. The IDE will keep suggesting ESM — ignore that hint.
- **Vanilla webview**: webview/index.html is one self-contained file. Don't add React or a bundler.
- **Settings vs SecretStorage**: API keys go in SecretStorage (`context.secrets`), preferences go in `vscode.workspace.getConfiguration("atlas")`.
- **Model picker**: pills are ordered cheapest → most expensive: GEMINI / HAIKU / SONNET / OPUS. Default is `gemini-2.5-flash`.
- **Version bumps**: package.json + webview footer (`v0.0.X`) both update.
- **Per-workspace overrides**: settings respect `.vscode/settings.json` automatically.

## Roadmap

1. **Google Calendar OAuth + push notifications** for schedule reminders (user explicitly requested)
2. Voice input + TTS output
3. Markdown rendering in chat (code blocks, lists)
4. Persistent chat history (per-workspace storageState)

## Things to avoid

- Don't add a build step / bundler — keep `extension.js` and `webview/index.html` directly editable
- Don't switch to ESM — VSCode extensions use CommonJS
- Don't bake the API keys into the package — always SecretStorage
- Don't break the message protocol (`chat`, `chatDelta`, `chatDone`, `chatError`) — both providers use it

## Files to know

| File | Purpose |
|------|---------|
| `package.json` | Extension manifest, commands, settings schema, dependencies |
| `extension.js` | Activation, command handlers, chat router (Anthropic/Gemini) |
| `webview/index.html` | Whole HUD UI — HTML + CSS + JS in one file |
| `USING_ATLAS.md` | End-user setup/usage doc |
| `README.md` | GitHub repo description |
| `JOURNAL.md` | Project history + decisions log |
