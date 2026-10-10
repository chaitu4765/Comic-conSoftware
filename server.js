const { parse } = require("url");
const path = require("path");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const projectRoot = __dirname;
// Keep live-development chunks separate from production builds. Otherwise a
// build can overwrite the dev manifest while the host screen is still open.
const app = next({
  dev,
  dir: projectRoot,
  conf: { distDir: dev ? ".next-dev" : ".next" },
});
const fs = require("fs");
const handle = app.getRequestHandler();

let httpsOptions = {};
var { createServer } = require("http");
if (dev) {
  var { createServer } = require("http");
  httpsOptions = {
    key: fs.readFileSync(path.join(projectRoot, "dev/cert/localhost.key")),
    cert: fs.readFileSync(path.join(projectRoot, "dev/cert/localhost.crt")),
  };
}

const PORT = process.env.PORT || 8000;
app.prepare().then(async () => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
