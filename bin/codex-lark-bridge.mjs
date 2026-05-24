#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const adapterDir = join(rootDir, "adapters");
const defaultConfig = `${process.env.HOME}/.lark-channel/codex-config.json`;

function printHelp() {
  console.log(`codex-lark-bridge

Usage:
  codex-lark-bridge run [--config ~/.lark-channel/codex-config.json]
  codex-lark-bridge ps
  codex-lark-bridge kill <id|#>
  codex-lark-bridge upload --text "hello"

First run:
  codex-lark-bridge run

The first run opens the Feishu/Lark app binding wizard. It stores Codex bot
credentials separately at ~/.lark-channel/codex-config.json by default.`);
}

function extractConfig(args) {
  const next = [];
  let config = process.env.CODEX_LARK_CONFIG || defaultConfig;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--config") {
      config = args[i + 1];
      i += 1;
    } else {
      next.push(args[i]);
    }
  }
  return { config, args: next };
}

function runBridge(args, extraEnv = {}) {
  const env = {
    ...process.env,
    ...extraEnv,
    PATH: `${adapterDir}:${process.env.PATH || ""}`,
  };
  const child = spawn("lark-channel-bridge", args, {
    stdio: "inherit",
    env,
  });
  child.on("error", (error) => {
    if (error.code === "ENOENT") {
      const fallback = spawn("npx", ["-y", "lark-channel-bridge@latest", ...args], {
        stdio: "inherit",
        env,
      });
      fallback.on("exit", (code) => process.exit(code ?? 1));
      fallback.on("error", (fallbackError) => {
        console.error(`failed to start lark-channel-bridge: ${fallbackError.message}`);
        process.exit(1);
      });
      return;
    }
    console.error(`failed to start lark-channel-bridge: ${error.message}`);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

const [command = "run", ...rest] = process.argv.slice(2);

if (command === "--help" || command === "-h" || command === "help") {
  printHelp();
  process.exit(0);
}

if (command === "--version" || command === "-v") {
  console.log("0.1.0");
  process.exit(0);
}

if (command === "run") {
  const parsed = extractConfig(rest);
  runBridge(["run", "--config", parsed.config, ...parsed.args], {
    CODEX_LARK_CONFIG: parsed.config,
  });
} else if (command === "upload") {
  const uploadBin = join(rootDir, "bin", "codex-feishu-upload.mjs");
  const child = spawn(process.execPath, [uploadBin, ...rest], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
} else if (["ps", "kill", "secrets", "status", "stop", "restart", "unregister"].includes(command)) {
  runBridge([command, ...rest]);
} else {
  console.error(`unknown command: ${command}`);
  printHelp();
  process.exit(2);
}
