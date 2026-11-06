"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8"
};

function sendFile(file, status, response) {
  fs.readFile(file, function (error, data) {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(file).toLowerCase();
    response.writeHead(status, {
      "Content-Type": types[extension] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(data);
  });
}

function notFound(response) {
  sendFile(path.join(root, "404.html"), 404, response);
}

const server = http.createServer(function (request, response) {
  let pathname;

  try {
    pathname = decodeURIComponent((request.url || "/").split("?")[0]);
  } catch (error) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  const relative = pathname.replace(/^\/+/, "");
  let file = path.resolve(root, relative);

  if (file !== root && !file.startsWith(root + path.sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(file, function (error, stats) {
    if (!error && stats.isDirectory()) {
      file = path.join(file, "index.html");
    }

    fs.stat(file, function (fileError, fileStats) {
      if (fileError || !fileStats.isFile()) {
        notFound(response);
        return;
      }

      sendFile(file, 200, response);
    });
  });
});

server.listen(port, function () {
  console.log("Function Psi is running at http://localhost:" + port);
  console.log("Serving " + root);
});
