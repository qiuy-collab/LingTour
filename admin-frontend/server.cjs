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

  // Strip browser-only headers that can confuse the upstream API
  const STRIP_HEADERS = new Set([
    "cookie", "referer", "x-forwarded-for", "x-forwarded-proto",
    "cf-connecting-ip", "cf-ray", "cf-visitor", "cf-ipcountry",
  ]);
  const safeHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!STRIP_HEADERS.has(key.toLowerCase()) && value !== undefined) {
      safeHeaders[key] = value;
    }
  }

  const proxyRequest = client.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        ...safeHeaders,
        host: targetUrl.host,
        origin: apiOrigin,
      },
    },
    (proxyResponse) => {
      // Strip upstream CORS headers — we add our own below
      const { 'access-control-allow-origin': _aco,
              'access-control-allow-credentials': _acc,
              'access-control-allow-methods': _acm,
              'access-control-allow-headers': _ach,
              'access-control-max-age': _ama,
              ...responseHeaders } = proxyResponse.headers;

      // Always add CORS headers for the admin frontend
      const reqOrigin = req.headers.origin || "";
      responseHeaders["access-control-allow-origin"] = reqOrigin || "*";
      responseHeaders["access-control-allow-credentials"] = "true";
      responseHeaders["access-control-allow-methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
      responseHeaders["access-control-allow-headers"] = "Content-Type, Authorization, Accept-Language";

      res.writeHead(proxyResponse.statusCode || 502, responseHeaders);
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
  // Handle CORS preflight for API requests
  if (req.method === "OPTIONS" && (req.url || "").startsWith("/api/admin")) {
    res.writeHead(204, {
      "access-control-allow-origin": req.headers.origin || "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization, Accept-Language",
      "access-control-max-age": "86400",
    });
    res.end();
    return;
  }

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
