const { cpSync, existsSync, mkdirSync, rmSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const cwd = __dirname;
const port = process.env.PORT || "3001";
const host = process.env.HOST || "0.0.0.0";
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const standaloneCandidates = [
  path.join(cwd, ".next", "standalone", "server.js"),
  path.join(cwd, ".next", "standalone", "site", "server.js"),
];

function fail(message) {
  console.error(`[site] ${message}`);
  process.exit(1);
}

const standaloneServer = standaloneCandidates.find((candidate) => existsSync(candidate));

if (standaloneServer) {
  const standaloneRoot = path.dirname(standaloneServer);
  const sourceStaticDir = path.join(cwd, ".next", "static");
  const targetStaticDir = path.join(standaloneRoot, ".next", "static");
  const sourcePublicDir = path.join(cwd, "public");
  const targetPublicDir = path.join(standaloneRoot, "public");

  if (existsSync(sourceStaticDir)) {
    rmSync(targetStaticDir, { recursive: true, force: true });
    mkdirSync(path.dirname(targetStaticDir), { recursive: true });
    cpSync(sourceStaticDir, targetStaticDir, { recursive: true });
  }

  if (existsSync(sourcePublicDir)) {
    rmSync(targetPublicDir, { recursive: true, force: true });
    cpSync(sourcePublicDir, targetPublicDir, { recursive: true });
  }

  process.env.PORT = port;
  process.env.HOSTNAME = host;
  require(standaloneServer);
  return;
}

if (!existsSync(nextBin)) {
  fail("missing node_modules/next. Run npm install first.");
}

if (!existsSync(path.join(cwd, ".next"))) {
  fail("missing .next build output. Run npm run build first.");
}

const child = spawn(
  process.execPath,
  [nextBin, "start", "-p", String(port), "-H", host],
  {
    cwd,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
