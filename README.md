# codex-lark-bridge

Use OpenAI Codex from Feishu/Lark messages.

This project wraps [`lark-channel-bridge`](https://www.npmjs.com/package/lark-channel-bridge) with a small adapter so Feishu/Lark messages are sent to the local `codex` CLI instead of Claude Code. The bridge package is launched at runtime, so this repo stays small and does not vendor the bridge.

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

From npm, after publishing:

```bash
npx -y codex-lark-bridge run
```

From GitHub:

```bash
npx -y github:YOUR_GITHUB_NAME/codex-lark-bridge run
```

The first run opens a QR code setup flow. Scan it with Feishu/Lark, create or select a bot, then message the bot in Feishu/Lark.

## Usage

Run the bridge:

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

Send text to the latest chat seen by the Codex bot:

```bash
codex-lark-bridge upload --text "Done."
```

Send an image:

```bash
codex-lark-bridge upload --image ./screenshot.png --text "Preview"
```

Send to a specific chat:

```bash
codex-lark-bridge upload --chat-id oc_xxx --file ./report.md
```

## Notes

- This is a local bridge. Codex runs on your machine.
- Do not reuse the same Feishu/Lark app for Claude Code and Codex. Use a separate bot/config.
- The default config path is `~/.lark-channel/codex-config.json`.
- Group chats normally require mentioning the bot.

## License

MIT
