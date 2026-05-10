# Plan: Pi "Prompt Stash" Extension (`pi-prompt-stash`)

## Context

When using Pi interactively, it's common to be halfway through composing a prompt when you realize you need to quickly send a different message first (e.g., a correction, a quick question, or a steering message). Currently there's no way to temporarily save what you've typed, send something else, and then get your draft back.

This extension adds a **stash/unstash** feature via a configurable keybinding (default: `alt+s`), so you can:

1. Press `alt+s` → saves the current prompt text, clears the editor, shows an indicator
2. Type and send your interrupting message normally
3. Right after sending (or press `alt+s` again) → the stashed text is restored into the editor

## Approach

Use a combination of Pi's extension APIs:

- **`pi.registerShortcut()`** — register a global keybinding (`alt+s` default) that toggles stash/unstash
- **`ctx.ui.getEditorText()` / `ctx.ui.setEditorText()`** — read and write the prompt editor contents
- **`ctx.ui.setStatus()`** — show a persistent footer indicator when a prompt is stashed
- **`pi.on("input")`** — detect when the user sends a message to auto-restore the stash immediately (before agent runs, so the editor is ready)
- **`pi.on("session_start")`** — restore stashed text into the editor on new sessions (carries stash across sessions), then clear state

### Flow

```
State: stashedText: string | null = null

[User presses alt+s]
  → currentText = getEditorText()
  → if currentText is empty, ignore
  → stash currentText
  → setEditorText("")
  → setStatus("prompt-stash", "📝 Prompt stashed (alt+s to restore)")
  → state: stashedText = currentText

[User types & sends a message]
  → on input event: if stashedText != null, restore immediately
    → setEditorText(stashedText)
    → setStatus("prompt-stash", undefined) // clear
    → stashedText = null
  → agent runs normally (user's message already submitted, stash is back in editor)

[User presses alt+s again (before sending)]
  → if stashedText != null (stash exists)
    → setEditorText(stashedText)
    → setStatus("prompt-stash", undefined)
    → stashedText = null
  → else
    → (same as initial stash flow above)
```

## Files to Create

| File | Purpose |
|------|---------|
| `~/.pi/agent/extensions/prompt-stash.ts` | Single-file extension |

## Reuse

No external dependencies needed. All APIs come from Pi's built-in extension runtime:

- `ExtensionAPI` type from `@earendil-works/pi-coding-agent` (auto-resolved)
- `ctx.ui.getEditorText()`, `ctx.ui.setEditorText()` — read/write the prompt editor
- `ctx.ui.setStatus(key, text)` — show persistent footer indicator
- `ctx.ui.notify(msg, type)` — ephemeral notification
- `pi.registerShortcut(key, options)` — register global keybinding
- `pi.on("input")` — detect when user sends a message to auto-restore immediately
- `pi.on("session_start")` — initialize/reset state

## Steps

- [ ] Create `~/.pi/agent/extensions/prompt-stash.ts`
- [ ] Define module-level state: `stashedText: string | null`
- [ ] Register `pi.on("session_start")` to restore any stashed text into the editor (so stash survives across sessions) and clear state
- [ ] Register `pi.registerShortcut("alt+s", { ... })` with toggle logic:
  - If stashed: restore to editor, clear status, set `stashedText = null`
  - If not stashed: read editor, save to `stashedText`, clear editor, set status indicator
  - Ignore if editor is empty (nothing to stash)
- [ ] Register `pi.on("input")` to auto-restore stashed text right when the user sends a message
  - Check `stashedText != null` on every input, restore into editor immediately
  - The user's submitted message is already being processed; the editor is free to populate
- [ ] Add edge-case handling:
  - If editor has content when auto-restoring from input event, skip restore and notify user their stash is still available via `alt+s`
- [ ] Test the extension by loading it and verifying:
  1. `alt+s` stashes text and shows indicator
  2. Sending a message restores the stash immediately (editor is pre-filled while agent runs)
  3. `alt+s` again manually restores
  4. New session resets state
  5. Empty editor doesn't trigger stash

## Verification

1. Place file at `~/.pi/agent/extensions/prompt-stash.ts`
2. Start `pi` (it auto-discovers extensions in that directory)
3. Type some text in the prompt, press `alt+s` → text should disappear, footer shows stash indicator
4. Press `alt+s` again → text should reappear, footer clears
5. Stash again, type a short message and send it → stashed text should immediately appear in editor while agent processes
6. Stash, type new text (don't send), wait for nothing → stash remains available via `alt+s`
