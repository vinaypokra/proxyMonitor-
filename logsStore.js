const apiLogs = [];
const MAX_LOGS = 1000;

function addLog(log) {
  apiLogs.push(log);
  if (apiLogs.length > MAX_LOGS) apiLogs.shift();
}

function clearLogs() {
  apiLogs.length = 0;
}

module.exports = { apiLogs, addLog, clearLogs };
