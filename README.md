# pi-save

Stash and restore your [Pi](https://pi.dev) prompt via `alt+s`.

Temporarily save what you're typing so you can send a different message first. The stash is restored automatically after you send, or manually via the shortcut again.

## Install

```bash
pi install git:git@github.com:asermax/pi-save.git
```

## Usage

| Action | Result |
|--------|--------|
| `alt+s` (with text in editor) | Stashes the current prompt, clears the editor, shows indicator |
| `alt+s` (with stash active) | Restores the stashed text into the editor |
| Send a message (with stash active) | Auto-restores the stash into the editor immediately |

The stash survives across sessions — if you start a new session while a prompt is stashed, it'll be restored into the editor on startup.

## License

MIT
