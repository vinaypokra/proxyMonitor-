const axios = require("axios");
const https = require("https");
const { ENVIRONMENTS } = require("./env");
const { addLog } = require("./logsStore");
const { broadcast } = require("./ws");

module.exports = (getActiveEnv) => async (req, res) => {
  const serviceName = req.params.serviceName;
  const wildcardPath = req.params[0] || "";

  const activeEnv = getActiveEnv();
  const services = ENVIRONMENTS[activeEnv];

  if (!services[serviceName]) return res.status(404).json({ error: "Unknown service" });

  const isTokenCall = wildcardPath.includes("token");
  const target = isTokenCall ? "http://localhost:8081/generic-service" : services[serviceName];
  const forwardUrl = target + req.originalUrl.replace(`/${serviceName}`, "");

  let reqJson = null;
  try { reqJson = JSON.parse(req.rawBody); } catch {}

  try {
    const resp = await axios({
      method: req.method,
      url: forwardUrl,
      data: req.rawBody,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { ...req.headers, host: undefined },
      validateStatus: () => true,
    });

    let resJson = resp.data;
    if (typeof resJson === "string") {
      try { resJson = JSON.parse(resJson); } catch {}
    }

    const log = {
      time: new Date().toISOString(),
      env: activeEnv,
      resHeader: resp.headers,
      service: serviceName,
      method: req.method,
      url: req.originalUrl,
      request: reqJson,
      response: resJson,
    };

    addLog(log);
    broadcast(log);

   // ✅ Forward ALL response headers
    Object.entries(resp.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    });

    // Optional: override CORS if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(resp.status).send(resp.data);
  } catch (e) {
    console.error("Proxy error", e.message);
    res.status(500).json({ error: e.message });
  }
};
