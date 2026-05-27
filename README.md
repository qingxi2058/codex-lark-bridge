# codex-lark-bridge

Use OpenAI Codex from Feishu/Lark messages.

This project is a Codex adapter for [`zarazhangrui/feishu-claude-code-bridge`](https://github.com/zarazhangrui/feishu-claude-code-bridge). The upstream bridge package is published on npm as [`lark-channel-bridge`](https://www.npmjs.com/package/lark-channel-bridge).

The upstream project already does the hard Feishu/Lark work: QR binding, streaming cards, per-chat sessions, workspaces, access control, files, and process management. This repo keeps that behavior and only swaps the local agent from Claude Code to OpenAI Codex through a small CLI adapter. The bridge package is launched at runtime, so this repo stays small and does not vendor the bridge.

## What It Does

- Creates a Feishu/Lark bot through the existing `lark-channel-bridge` setup wizard.
- Routes private messages and group mentions to local Codex.
- Keeps its own app config at `~/.lark-channel/codex-config.json`, so it can run beside a Claude Code bot.
- Includes a helper command to send text, images, and files back to Feishu/Lark.

## Requirements

- Node.js 20 or newer
- OpenAI Codex CLI installed and logged in
- Feishu/Lark desktop or mobile app for first-time QR binding

Check Codex first:

```bash
codex --version
```

## One Command Start

From GitHub (recommended, npm not yet published):

```bash
npx -y github:qingxi2058/codex-lark-bridge run
```

From npm (after publishing):

```bash
npx -y codex-lark-bridge run
```

The first run opens a QR code setup flow. Scan it with Feishu/Lark, create or select a bot, then message the bot in Feishu/Lark.

## Security First

This bot can run Codex on your local machine. Treat anyone who can message the bot as someone who can ask a local coding agent to read and change files in the selected workspace.

For personal use, bind a dedicated Feishu/Lark bot and keep it private. For any shared workspace, send `/config` in Feishu/Lark and set at least:

- `Admins`: your own `open_id`
- `Allowed users`: the people who may use the bot
- `Allowed chats`: the groups where the bot may respond

Do this before adding the bot to a large group.

## Usage

While the npm package is not published, keep using the GitHub runner:

Run the bridge:

```bash
npx -y github:qingxi2058/codex-lark-bridge run
```

Use a custom config path:

```bash
npx -y github:qingxi2058/codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json
```

List bridge processes:

```bash
npx -y github:qingxi2058/codex-lark-bridge ps
```

Stop a bridge process:

```bash
npx -y github:qingxi2058/codex-lark-bridge kill 1
```

After npm publishing, the short command is also available:

```bash
codex-lark-bridge run
```

Use a custom config path:

```bash
codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json
```

List bridge processes:

```bash
codex-lark-bridge ps
```

Stop a bridge process:

```bash
codex-lark-bridge kill 1
```

## Send Results Back To Feishu/Lark

Send text to the latest chat seen in local lark-channel logs:

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --text "Done."
```

Send an image:

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --image ./screenshot.png --text "Preview"
```

Send to a specific chat:

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --chat-id oc_xxx --file ./report.md
```

If you run both Claude Code and Codex bridges on the same machine, prefer `--chat-id` so the upload target is explicit.

## Notes

- This is a local bridge. Codex runs on your machine.
- Do not reuse the same Feishu/Lark app for Claude Code and Codex. Use a separate bot/config.
- The default config path is `~/.lark-channel/codex-config.json`.
- Group chats normally require mentioning the bot.
- Use Feishu/Lark `/config` access control before sharing the bot.

## License

MIT
