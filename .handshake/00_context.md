# 00 Context

Project: ATLAS Dashboard

Purpose:
- VSCode extension that opens a Jarvis-style dashboard on startup.
- Plain HTML/CSS/JS webview.
- CommonJS extension host in `extension.js`.
- Supports Claude and Gemini chat with model picker.
- API keys are stored in VSCode SecretStorage, not settings.

Important repos:
- VSCode dashboard: https://github.com/oksoimcodingnow/atlas-dashboard
- Mobile: https://github.com/oksoimcodingnow/atlas-mobile

Safety priorities:
- Never store API keys in settings or repo files.
- Keep `extension.js` CommonJS unless the extension architecture is intentionally changed.
- Package and install locally before calling a VSCode release complete.
- Keep the webview no-build and easy to edit.

Current known 95 percent line:
- v0.0.8 added Gemini free tier.
- Packaging worked locally.
- Further features should prefer handshake review if they affect model routing or secrets.

