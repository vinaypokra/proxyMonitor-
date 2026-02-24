const WebSocket = require("ws");

let wss;

function initWS(server) {
  wss = new WebSocket.Server({ server });
  console.log("WebSocket Ready");
}

function broadcast(log) {
  if (!wss) return;
  const data = JSON.stringify(log);
  wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(data));
}

module.exports = { initWS, broadcast };
