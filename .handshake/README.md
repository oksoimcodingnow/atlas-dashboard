# AI Handshake Protocol

This folder is the communication layer between Codex and an external AI reviewer such as Claude Pro or ChatGPT Plus.

Use it for non-trivial changes to the VSCode ATLAS extension, especially anything involving API keys, model routing, extension packaging, or commands that can touch files.

## The Idea

Codex can work directly in this repo. Claude Pro / ChatGPT Plus cannot see the local workspace unless you paste context to them. The handshake files make that manual bridge clean and repeatable.

```text
Codex Builder
  -> writes 01_codex_packet.md
You
  -> paste that packet into Claude/ChatGPT
External Reviewer
  -> returns findings, risks, approval or rejection
You
  -> paste review into 02_external_review.md or back into chat
Codex Builder
  -> responds/fixes in 03_codex_response.md
Final Decision
  -> record APPROVED / CHANGES_REQUESTED / BLOCKED in 04_decision.md
```

## Status Rules

- `DRAFT`: Codex is still preparing the packet.
- `READY_FOR_REVIEW`: Paste `01_codex_packet.md` into Claude/ChatGPT.
- `CHANGES_REQUESTED`: Reviewer found issues that must be fixed.
- `APPROVED`: Safe to package/install/push.
- `BLOCKED`: Missing information, credentials, or access.

## When To Use

Use handshake for:

- Model provider changes.
- SecretStorage or API-key handling.
- VSCode command behavior.
- Packaging/install flow changes.
- Large webview UI rewrites.

Skip handshake for:

- Small copy edits.
- Simple docs updates.
- Visual tweaks that do not affect behavior.

## External Reviewer Prompt

Paste this before the packet:

```text
You are the external reviewer for ATLAS Dashboard, a VSCode extension. Review this change like a senior engineer.

Focus on:
- Extension-host bugs
- Webview security issues
- SecretStorage/API-key mistakes
- Packaging/install risks
- Missing verification
- Simpler implementation options

Return:
1. Verdict: APPROVED, CHANGES_REQUESTED, or BLOCKED
2. Findings ordered by severity
3. Questions/assumptions
4. Suggested fixes

Do not rewrite the whole implementation unless necessary.
```

