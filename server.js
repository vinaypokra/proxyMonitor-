const express = require("express");
const http = require("http");
const getRawBody = require("raw-body");

const { apiLogs, clearLogs } = require("./logsStore");
const { getEnv, setEnv } = require("./env");
const { initWS } = require("./ws");
const proxyHandler = require("./proxy");

const app = express();

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// RAW BODY
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    req.rawBody = await getRawBody(req, { encoding: req.headers["content-encoding"] ? null : "utf8" });
    next();
  } catch (e) { next(e); }
});

// Static UI
app.use(express.static("public"));

// ENV API
app.get("/env", (req, res) => res.json(getEnv()));
app.post("/env/:env", (req, res) => {
  try { setEnv(req.params.env); res.json(getEnv()); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// Logs API
app.get("/logs", (req, res) => res.json(apiLogs));
app.delete("/logs", (req, res) => { clearLogs(); res.json({ ok: true }); });

// Proxy
app.use("/:serviceName/*", proxyHandler(() => getEnv().activeEnv));

const server = http.createServer(app);
initWS(server);

server.listen(3001, () => console.log("Proxy Monitor running http://localhost:3001"));
