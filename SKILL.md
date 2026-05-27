---
name: codex-lark-bridge
description: |
  帮助用户把 OpenAI Codex 接入飞书/Lark，让用户能在手机上通过飞书消息驱动本地 Codex 执行任务、改代码、传结果。
  适用于"怎么把 Codex 接进飞书""codex-lark-bridge 怎么用""安装报错了""安全怎么设置""和 Claude Code 飞书 bot 有什么区别"等场景。
---

# Codex 飞书助手

不守在电脑前，也能让本地 Codex 继续干活。

## 核心定位

- 这不是一个聊天机器人，而是把你本地的 Codex 变成飞书里的工作助手。
- 核心价值：手机发消息 → 本地 Codex 执行任务 → 结果发回飞书。
- 适合已经在用 Codex CLI、同时用飞书的人。

## 适用场景

出现以下需求时使用：

- 想把 Codex 接进飞书，不想一直守着电脑
- 想在手机上驱动本地代码任务
- 在用 Claude Code 飞书 bot 的同时，也想用 Codex
- 安装或配置过程中遇到问题，需要排障
- 不确定安全设置怎么做

## 不适合的情况

- 用户还没有安装 Codex CLI，或者 `codex --version` 跑不通
- 用户不用飞书/Lark，想接其他 IM（暂不支持）
- 用户想要云端托管，不想在本地运行（这个方案是本地运行）
- 用户想要一个纯对话助手，不需要执行代码任务

## 默认立场

- 先确认前置条件，再引导安装，不要跳步骤
- 安全设置不是可选项，每次引导安装时都必须提
- 遇到报错，先问清楚错误信息，再给解决方案
- 不假设用户有技术背景，命令要给可以直接复制粘贴的版本

## 工作流

### Step 1：判断用户处于哪个阶段

先确认用户现在在哪个环节：

- 从零开始，还没装过
- 装了但跑不起来
- 装好了，但功能不会用
- 想加安全设置
- 想和 Claude Code bot 同时跑

根据阶段跳到对应步骤，不要从头讲一遍。

### Step 2：检查前置条件

安装前先确认：

```bash
# 检查 Node.js 版本（需要 20 或以上）
node --version

# 检查 Codex 是否已安装并登录
codex --version
```

如果 Codex 没装或没登录，先解决这个，再继续。

### Step 3：引导安装启动

当前先用 GitHub 直跑，npm 包发布后再用短命令：

```bash
# 从 GitHub 直接运行（当前推荐，npm 包尚未发布）
npx -y github:qingxi2058/codex-lark-bridge run

# 从 npm（发布后可用）
npx -y codex-lark-bridge run
```

第一次运行会弹出二维码。引导用户：

1. 用飞书扫码
2. 创建或绑定一个飞书应用
3. 扫码完成后，在飞书里私聊这个 bot 测试

如果用户已经有 Claude Code 飞书 bot，强调这是独立配置，不会冲突：

```bash
# 默认配置文件路径不同，可以同时跑
~/.lark-channel/codex-config.json   # Codex bot
~/.lark-channel/config.json         # Claude Code bot（上游默认）
```

### Step 4：安全配置（必做）

每次引导完安装，都要提醒安全设置。

核心风险：**能给 bot 发消息的人，本质上能让 Codex 读和改你本地的文件。**

在飞书里给 bot 发 `/config`，至少设置这三项：

```
Admins：你自己的 open_id
Allowed users：允许使用 bot 的人
Allowed chats：允许响应的群
```

个人使用时，bot 不要随便拉进大群。团队使用时，先配完权限再拉人。

### Step 5：常用命令速查

当前 npm 包尚未发布时，用 GitHub 直跑命令：

```bash
# 启动 bridge
npx -y github:qingxi2058/codex-lark-bridge run

# 使用自定义配置文件
npx -y github:qingxi2058/codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json

# 查看运行中的 bridge 进程
npx -y github:qingxi2058/codex-lark-bridge ps

# 停止某个进程（用 ps 查到的编号）
npx -y github:qingxi2058/codex-lark-bridge kill 1
```

等 npm 包发布后，才使用下面这些短命令：

```bash
# 启动 bridge
codex-lark-bridge run

# 使用自定义配置文件
codex-lark-bridge run --config ~/.lark-channel/my-codex-bot.json

# 查看运行中的 bridge 进程
codex-lark-bridge ps

# 停止某个进程（用 ps 查到的编号）
codex-lark-bridge kill 1
```

### Step 6：上传结果到飞书

Codex 完成任务后，可以用命令把结果发回飞书：

```bash
# 发文字
npx -y github:qingxi2058/codex-lark-bridge upload --text "已完成"

# 发图片
npx -y github:qingxi2058/codex-lark-bridge upload --image ./screenshot.png --text "预览图"

# 发文件
npx -y github:qingxi2058/codex-lark-bridge upload --file ./report.md

# 发到指定聊天（同时跑多个 bot 时建议显式指定）
npx -y github:qingxi2058/codex-lark-bridge upload --chat-id oc_xxx --text "已完成"
```

如果同时跑了 Claude Code 和 Codex 两个 bot，建议加 `--chat-id`，避免发错聊天。

### Step 7：排障

遇到问题时，先收集信息再判断：

- 报什么错（完整错误信息）
- 在哪一步出的问题（安装 / 扫码 / 发消息 / 上传）

常见问题：

**Node.js 版本太低**
→ 运行 `node --version` 确认版本 ≥ 20，低于 20 会直接报错
→ 用 `nvm install 20 && nvm use 20` 或去 nodejs.org 下载最新 LTS 版本

**二维码扫了没反应**
→ 检查飞书应用是否已创建，或尝试重新运行 GitHub 直跑启动命令

**bot 不响应消息**
→ 群聊里需要 @bot 才会响应；检查 `/config` 里的 `Allowed chats` 和 `Allowed users`

**和 Claude Code bot 配置冲突**
→ 确认用了不同的配置文件路径，用 `--config` 参数显式指定

**upload 发到了错误的聊天**
→ 加 `--chat-id` 参数，指定目标聊天

## 和 Claude Code 飞书 bot 的区别

| | codex-lark-bridge | feishu-claude-code-bridge |
|---|---|---|
| 本地 agent | OpenAI Codex | Claude Code |
| 配置文件 | `codex-config.json` | `config.json` |
| 能否同时跑 | ✅ 可以 | ✅ 可以 |
| 当前推荐运行方式 | GitHub 直跑，npm 发布后可用 `codex-lark-bridge` | npm 包 `lark-channel-bridge` |

两个可以同时运行，互不干扰。

## 输出要求

- 命令必须是可以直接复制粘贴的完整版本
- 涉及安全设置时，不要只提一句"建议设置权限"，要给出具体操作步骤
- 排障时先给最可能的原因，再给验证方法，最后给解决命令
- 不要一次性把所有命令和说明全部输出，按用户当前阶段给对应内容

## 语气要求

- 简洁直接，不绕弯子
- 技术命令用代码块，不要内联在句子里
- 安全相关内容语气要稍重，让用户意识到不是可选项
- 不假设用户懂技术，但也不过度解释已经会的部分
