# Architecture

This project is intentionally a thin adapter over
[`zarazhangrui/feishu-claude-code-bridge`](https://github.com/zarazhangrui/feishu-claude-code-bridge),
published to npm as `lark-channel-bridge`.

`lark-channel-bridge` currently launches a local command named `claude`.

This project prepends `adapters/` to `PATH`, so `lark-channel-bridge` finds
`adapters/claude`. That adapter accepts the Claude Code streaming JSON shape
expected by `lark-channel-bridge`, calls `codex exec --json`, and translates the
final Codex result back into the events consumed by the bridge.

The default config path is intentionally separate:

```text
~/.lark-channel/codex-config.json
```

That lets users run an existing Claude Code bot and this Codex bot at the same
time without both processes fighting for the same Feishu/Lark app.
