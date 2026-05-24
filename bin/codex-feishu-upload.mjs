#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { randomUUID } from "node:crypto";

const HOME = process.env.HOME;
const DEFAULT_CONFIG = process.env.CODEX_LARK_CONFIG || `${HOME}/.lark-channel/codex-config.json`;
const LOG_FILE = `${HOME}/.lark-channel/logs/${new Date().toISOString().slice(0, 10)}.log`;

function parseArgs(argv) {
  const args = { config: DEFAULT_CONFIG };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--config") args.config = value, i += 1;
    else if (key === "--chat-id") args.chatId = value, i += 1;
    else if (key === "--text") args.text = value, i += 1;
    else if (key === "--markdown") args.markdown = value, i += 1;
    else if (key === "--image") args.image = value, i += 1;
    else if (key === "--file") args.file = value, i += 1;
    else if (key === "--help" || key === "-h") args.help = true;
    else throw new Error(`unknown argument: ${key}`);
  }
  return args;
}

function printHelp() {
  console.log(`codex-feishu-upload

Usage:
  codex-feishu-upload --text "hello"
  codex-feishu-upload --image /path/to/image.png --text "caption"
  codex-lark-bridge upload --file /path/to/report.md --chat-id oc_xxx

Options:
  --chat-id    Target Feishu chat id. If omitted, uses the latest chat seen by the Codex bot.
  --text       Plain text message.
  --markdown   Markdown message.
  --image      Local image path to upload and send.
  --file       Local file path to upload and send.
  --config     Codex Lark config path. Default: ~/.lark-channel/codex-config.json`);
}

function latestChatIdFromLog() {
  if (!existsSync(LOG_FILE)) return "";
  const text = readFileSync(LOG_FILE, "utf8").trim();
  if (!text) return "";
  const lines = text.split("\n").reverse();
  for (const line of lines) {
    try {
      const evt = JSON.parse(line);
      if (evt.phase === "intake" && evt.event === "enter" && evt.chatId) return evt.chatId;
    } catch {
      // Ignore malformed log lines.
    }
  }
  return "";
}

async function readSecret(config) {
  const ref = config.accounts?.app?.secret;
  if (typeof ref === "string") return ref;
  const providerName = ref.provider ?? config.secrets?.defaults?.exec ?? "bridge";
  const provider = config.secrets?.providers?.[providerName];
  if (!provider?.command) throw new Error("missing secret provider in config");
  const ids = [ref.id, `app-${config.accounts.app.id}`].filter(Boolean);
  const output = await runJson(provider.command, provider.args ?? [], { ids });
  for (const id of ids) {
    if (output.values?.[id]) return output.values[id];
  }
  throw new Error(`app secret not found for ${ids.join(", ")}`);
}

function runJson(command, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => stdout += chunk);
    child.stderr.on("data", (chunk) => stderr += chunk);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) return reject(new Error(stderr || `${command} exited with ${code}`));
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`invalid JSON from ${command}: ${error.message}`));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

async function getTenantAccessToken(appId, appSecret) {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 0) throw new Error(`tenant token failed: ${data.msg || res.statusText}`);
  return data.tenant_access_token;
}

async function uploadImage(token, imagePath) {
  if (!existsSync(imagePath)) throw new Error(`image not found: ${imagePath}`);
  const form = new FormData();
  form.append("image_type", "message");
  form.append("image", new Blob([readFileSync(imagePath)], { type: mimeType(imagePath) }), basename(imagePath));
  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/images", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || data.code !== 0) throw new Error(`image upload failed: ${data.msg || res.statusText}`);
  return data.data.image_key;
}

async function uploadFile(token, filePath) {
  if (!existsSync(filePath)) throw new Error(`file not found: ${filePath}`);
  const form = new FormData();
  form.append("file_type", "stream");
  form.append("file_name", basename(filePath));
  form.append("file", new Blob([readFileSync(filePath)], { type: "application/octet-stream" }), basename(filePath));
  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/files", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || data.code !== 0) throw new Error(`file upload failed: ${data.msg || res.statusText}`);
  return data.data.file_key;
}

async function sendMessage(token, chatId, msgType, content) {
  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: msgType,
      content: JSON.stringify(content),
      uuid: randomUUID(),
    }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 0) throw new Error(`message send failed: ${data.msg || res.statusText}`);
  return data.data?.message_id;
}

function mimeType(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  if (!args.text && !args.markdown && !args.image && !args.file) {
    throw new Error("nothing to send: pass --text, --markdown, --image, or --file");
  }
  const config = JSON.parse(readFileSync(args.config, "utf8"));
  const chatId = args.chatId || latestChatIdFromLog();
  if (!chatId) throw new Error("missing --chat-id and no recent Codex bot chat found in logs");
  const appId = config.accounts?.app?.id;
  if (!appId) throw new Error("missing app id in config");
  const appSecret = await readSecret(config);
  const token = await getTenantAccessToken(appId, appSecret);

  const sent = [];
  if (args.text) sent.push(await sendMessage(token, chatId, "text", { text: args.text }));
  if (args.markdown) sent.push(await sendMessage(token, chatId, "post", {
    zh_cn: { title: "", content: [[{ tag: "text", text: args.markdown }]] },
  }));
  if (args.image) sent.push(await sendMessage(token, chatId, "image", { image_key: await uploadImage(token, args.image) }));
  if (args.file) sent.push(await sendMessage(token, chatId, "file", { file_key: await uploadFile(token, args.file) }));

  console.log(JSON.stringify({ ok: true, chatId, messageIds: sent.filter(Boolean) }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
