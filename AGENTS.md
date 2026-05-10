# AGENTS.md — pi-save

## Project Overview

**pi-save** is a [Pi](https://pi.dev) extension that lets users stash and restore their current prompt via `alt+s`. It's useful when you're composing a prompt but need to send a different message first — stash, send, and the original prompt is automatically restored.

The entire extension lives in a single file: `index.ts`.

## Architecture

- **Entry point**: `index.ts` — registers a shortcut (`alt+s`) and two event hooks (`session_start`, `input`) via the Pi Extension API
- **Stash lifecycle**: Text is held in a closure variable (`stashedText`). Stashing clears the editor and shows a status indicator. Restoring can be triggered manually (shortcut) or automatically (on message send / new session).
- **No build step** — Pi loads the TypeScript source directly.
- **No runtime dependencies** — only a peer dependency on `@earendil-works/pi-coding-agent`.

## Common Actions

### Install locally for development

```bash
pi install .
```

### Test changes

Re-install the extension after editing `index.ts`:

```bash
pi install .
```

Then restart Pi and exercise the `alt+s` flow: stash with text, restore with shortcut, verify auto-restore on send.

### Release

Uses [semantic-release](https://semantic-release.gitbook.io) via CI (`.github/workflows/publish.yml`). Push conventional commits to `main`:

- `fix:` → patch
- `feat:` → minor
- `feat!:` or `BREAKING CHANGE:` → major

No manual versioning or tagging required.

### Commit style

Use [Conventional Commits](https://www.conventionalcommits.org):

```
fix: correct auto-restore behavior when editor has content
feat: add option to disable auto-restore
```
