# codex-lark-bridge

把 OpenAI Codex 接到飞书/Lark。

这个项目是 [`zarazhangrui/feishu-claude-code-bridge`](https://github.com/zarazhangrui/feishu-claude-code-bridge) 的 Codex 适配版。上游桥接包在 npm 上对应的包名是 [`lark-channel-bridge`](https://www.npmjs.com/package/lark-channel-bridge)。

上游项目已经做好了飞书/Lark 侧的核心能力：扫码绑定、流式卡片、按聊天保持会话、工作区切换、权限控制、文件处理和进程管理。这个仓库不重写这些能力，只加一层小适配，把本地 agent 从 Claude Code 换成 OpenAI Codex。桥接包会在运行时调用，不打包进这个仓库。

## 能做什么

- 一条命令启动 Codex 飞书 bot。
- 首次运行扫码创建/绑定飞书应用。
- 私聊 bot 或在群里 @bot，就能让 Codex 工作。
- 和 Claude Code 的飞书 bot 分开配置，不互相抢。
- 附带上传命令，可以把文字、图片、文件发回飞书。

## 前置条件

- Node.js 20 或更高版本
- 本机已经安装并登录 Codex CLI
- 首次绑定时需要用飞书/Lark 扫码

先确认 Codex 可用：

```bash
codex --version
```

## 一键启动

从 GitHub 直接运行（当前推荐，npm 包尚未发布）：

```bash
npx -y github:qingxi2058/codex-lark-bridge run
```

从 npm（发布后可用）：

```bash
npx -y codex-lark-bridge run
```

第一次运行会出现二维码。用飞书扫码，按提示创建或绑定 bot。完成后，在飞书里私聊这个 bot 就可以用了。

## 先做安全设置

这个 bot 会在你的本机运行 Codex。能给 bot 发消息的人，本质上就能让一个本地代码 agent 去读和改当前工作区里的文件。

个人使用时，建议绑定一个独立的飞书/Lark bot，不要随便拉进大群。团队或群聊使用时，先在飞书里给 bot 发 `/config`，至少设置：

- `Admins`：你自己的 `open_id`
- `Allowed users`：允许使用 bot 的人
- `Allowed chats`：允许响应的群

这些设置完成后，再把 bot 放进多人群。

## 常用命令

当前 npm 包尚未发布时，推荐继续用 GitHub 直跑：

启动：

```bash
npx -y github:qingxi2058/codex-lark-bridge run
```

使用自定义配置：

```bash
npx -y github:qingxi2058/codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json
```

查看运行中的 bridge：

```bash
npx -y github:qingxi2058/codex-lark-bridge ps
```

停止某个进程：

```bash
npx -y github:qingxi2058/codex-lark-bridge kill 1
```

npm 包发布后，也可以使用短命令：

```bash
codex-lark-bridge run
```

使用自定义配置：

```bash
codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json
```

查看运行中的 bridge：

```bash
codex-lark-bridge ps
```

停止某个进程：

```bash
codex-lark-bridge kill 1
```

## 上传结果到飞书

发文字：

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --text "已完成"
```

发图片：

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --image ./screenshot.png --text "预览图"
```

发到指定聊天：

```bash
npx -y github:qingxi2058/codex-lark-bridge upload --chat-id oc_xxx --file ./report.md
```

如果不传 `--chat-id`，默认发到本机 lark-channel 日志里最近出现的聊天。

如果同一台机器同时跑 Claude Code 和 Codex 两个 bridge，建议显式传 `--chat-id`，避免发错聊天。

## 注意

- Codex 在你的本机运行，不是云端托管。
- 不要让 Claude Code 和 Codex 复用同一个飞书应用。
- 默认配置文件是 `~/.lark-channel/codex-config.json`。
- 群聊里一般需要 @bot 才会响应。
- 分享给别人或拉进群前，先用飞书里的 `/config` 做访问控制。

## License

MIT
