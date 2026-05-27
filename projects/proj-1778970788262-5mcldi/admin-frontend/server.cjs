const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");

const cwd = __dirname;
const port = Number(process.env.PORT || "4173");
const host = process.env.HOST || "0.0.0.0";
const distDir = path.join(cwd, "dist");
const indexFile = path.join(distDir, "index.html");
const apiOrigin = process.env.VITE_API_ORIGIN || "https://api.lingfengtranstour.cn";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function fail(message) {
  console.error(`[admin-frontend] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distDir) || !fs.existsSync(indexFile)) {
  fail("missing dist build output. Run npm run build first.");
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);

  stream.on("error", () => {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  });

  res.writeHead(200, { "Content-Type": type });
  stream.pipe(res);
}

function proxyApiRequest(req, res) {
  const incomingUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const targetPath = incomingUrl.pathname.startsWith("/api/admin/auth")
    ? incomingUrl.pathname.replace(/^\/api\/admin\/auth/, "/api/v1/auth")
    : incomingUrl.pathname.replace(/^\/api\/admin/, "/api/v1/admin");
  const targetUrl = new URL(`${targetPath}${incomingUrl.search}`, apiOrigin);
  const client = targetUrl.protocol === "https:" ? https : http;

  const proxyRequest = client.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
        origin: apiOrigin,
        referer: apiOrigin,
      },
    },
    (proxyResponse) => {
      res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(res);
    },
  );

  proxyRequest.on("error", (error) => {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        statusCode: 502,
        message: "Admin API proxy failed",
        error: error.message,
      }),
    );
  });

  req.pipe(proxyRequest);
}

const server = http.createServer((req, res) => {
  if ((req.url || "").startsWith("/api/admin")) {
    proxyApiRequest(req, res);
    return;
  }

  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const resolvedPath = path.resolve(distDir, `.${normalizedPath}`);

  if (!resolvedPath.startsWith(distDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    sendFile(resolvedPath, res);
    return;
  }

  sendFile(indexFile, res);
});

server.listen(port, host, () => {
  console.log(`[admin-frontend] listening on http://${host}:${port}`);
});
