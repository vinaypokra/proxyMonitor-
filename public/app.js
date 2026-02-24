const tbody = document.getElementById("logs");
const searchInput = document.getElementById("search");
let modalData = null;

/* THEME TOGGLE */
const themeBtn = document.getElementById("themeToggle");
const root = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.add("light");

themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  const mode = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", mode);
  themeBtn.textContent = mode === "light" ? "🌞" : "🌙";
};


/* ENV */
async function refreshEnv() {
  const r = await fetch("/env");
  const d = await r.json();
  document.getElementById("env").innerHTML =
    `Current: ${d.activeEnv}<br>${JSON.stringify(d.envURL, null, 2)}`;
}

async function setEnv(e) {
  await fetch("/env/" + e, { method: "POST" });
  refreshEnv();
}

/* CLEAR */
async function clearLogs() {
  await fetch("/logs", { method: "DELETE" });
  tbody.innerHTML = "";
}

/* MODAL */
function openModal(obj) {
  modalData = obj;
  document.getElementById("jsonViewer").textContent =
    JSON.stringify(obj, null, 2);
  document.getElementById("jsonModal").style.display = "block";
}

function closeModal() {
  document.getElementById("jsonModal").style.display = "none";
}

function copyModal() {
  navigator.clipboard.writeText(JSON.stringify(modalData, null, 2));
  alert("Copied JSON");
}

/* COPY ONE CLICK */
function copyFull(log) {
  const full = {
    env: log.env,
    url: log.url,
    method: log.method,
    payload: log.request,
    response: log.response,
  };
  navigator.clipboard.writeText(JSON.stringify(full, null, 2));
  alert("Copied Full Request/Response");
}

/* ADD ROW */
function addRow(l) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${l.time}</td>
    <td>${l.env}</td>
    <td>${l.service}</td>
    <td>${l.method}</td>
    <td title="${l.url}">${l.url}</td>
    <td><button onclick='openModal(${JSON.stringify(l)})'>👁</button></td>
    <td><button onclick='copyFull(${JSON.stringify(l)})'>📋</button></td>
  `;

  tbody.prepend(tr);
}

/* SEARCH FILTER */
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase();
  [...tbody.children].forEach(tr => {
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
  });
};

/* LOAD HISTORY */
fetch("/logs")
  .then(r => r.json())
  .then(d => d.forEach(addRow));

/* WEBSOCKET LIVE */
const ws = new WebSocket(`ws://${location.host}`);
ws.onmessage = e => addRow(JSON.parse(e.data));

refreshEnv();
