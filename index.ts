/**
 * Pi Save — Stash and restore your prompt via alt+s
 *
 * Temporarily save your current prompt so you can send a different message first.
 * The stash is restored automatically after you send a message, or manually via the shortcut.
 *
 * Usage:
 *   alt+s  — stash current prompt (or restore if already stashed)
 *
 * Install:
 *   pi install git:git@github.com:asermax/pi-save
 */
import { rawKeyHint } from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const SHORTCUT_KEY = "alt+s";

export default function (pi: ExtensionAPI) {
	let stashedText: string | null = null;

	const STATUS_KEY = "pi-save";
	const STASH_INDICATOR = `📝 Prompt stashed (${rawKeyHint(SHORTCUT_KEY, "to restore")})`;

	/**
	 * Restore stashed text into the editor.
	 * Returns true if restored, false if skipped.
	 */
	function restoreStash(ctx: any): boolean {
		if (stashedText === null) return false;

		const current = ctx.ui.getEditorText();
		if (current && current.trim().length > 0) {
			ctx.ui.notify(`Prompt stash skipped — editor has content. Press ${rawKeyHint(SHORTCUT_KEY, "to restore manually")}.`, "warning");
			return false;
		}

		ctx.ui.setEditorText(stashedText);
		ctx.ui.setStatus(STATUS_KEY, undefined);
		stashedText = null;
		return true;
	}

	// Restore stash on new sessions (carries stash across sessions)
	pi.on("session_start", async (_event, ctx) => {
		if (stashedText !== null) {
			restoreStash(ctx);
		}
	});

	// Toggle stash via shortcut
	pi.registerShortcut(SHORTCUT_KEY, {
		description: "Stash/restore current prompt",
		handler: async (ctx) => {
			if (stashedText !== null) {
				restoreStash(ctx);
			} else {
				const current = ctx.ui.getEditorText();
				if (!current || current.trim().length === 0) return;

				stashedText = current;
				ctx.ui.setEditorText("");
				ctx.ui.setStatus(STATUS_KEY, STASH_INDICATOR);
				ctx.ui.notify("Prompt stashed", "info");
			}
		},
	});

	// Auto-restore stash when user sends a message
	pi.on("input", async (_event, ctx) => {
		if (stashedText === null) return;
		restoreStash(ctx);
	});
}
