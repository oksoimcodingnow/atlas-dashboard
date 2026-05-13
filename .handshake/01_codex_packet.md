# 01 Codex Packet

Status: DRAFT
Date: YYYY-MM-DD
Builder: Codex
Reviewer: Claude Pro / ChatGPT Plus

## Goal

Describe the change in one or two sentences.

## Why This Change Matters

Explain the user or engineering value.

## Files Changed

| File | Change |
|------|--------|
| `path/to/file` | Short description |

## Implementation Summary

- Bullet 1
- Bullet 2
- Bullet 3

## Risk Areas

- Secret handling:
- Webview security:
- Extension commands:
- Packaging:
- UX:

## Verification Performed

| Check | Result |
|-------|--------|
| VSIX package | Not run / passed / failed |
| Extension install | Not run / passed / failed |
| Reload Window/manual UI test | Not run / passed / failed |

## Diff Summary For Reviewer

Paste a concise diff summary here. For large diffs, do not paste everything; include the key files and behavior changes.

## Questions For Reviewer

1. Is this safe to package and install?
2. Are there API-key or webview security issues?
3. Is the implementation unnecessarily complex?
4. What should be tested before push?

