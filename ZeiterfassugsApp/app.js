let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser) {
  window.location.href = "login.html";
}

let timer = null;
let startTime = null;
let accumulatedTime = 0;
let runningProject = null;

const projectNameInput = document.getElementById("projectNameInput");
const projectDropdown = document.getElementById("projectDropdown");
const liveTimer = document.getElementById("liveTimer");
const summaryDiv = document.getElementById("summary");
const messageArea = document.getElementById("messageArea");

const loadProjects = () => {
  const data = JSON.parse(localStorage.getItem(currentUser + "_projects")) || [];
  projectDropdown.innerHTML = `<option value="">— Projekt auswählen —</option>`;
  data.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    projectDropdown.appendChild(opt);
  });
};

const saveProject = name => {
  const data = JSON.parse(localStorage.getItem(currentUser + "_projects")) || [];
  if (!data.includes(name)) {
    data.push(name);
    localStorage.setItem(currentUser + "_projects", JSON.stringify(data));
  }
};

const formatTime = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const toDecimalHours = ms => (ms / 3600000).toFixed(2);

const updateTimer = () => {
  const now = Date.now();
  const elapsed = now - startTime + accumulatedTime;
  liveTimer.textContent = formatTime(elapsed);
};

const saveSession = (project, ms) => {
  const data = JSON.parse(localStorage.getItem(currentUser + "_logs")) || [];
  data.push({ project, duration: ms, date: new Date().toISOString() });
  localStorage.setItem(currentUser + "_logs", JSON.stringify(data));
};

const renderSummary = () => {
  const data = JSON.parse(localStorage.getItem(currentUser + "_logs")) || [];
  const summary = {};
  data.forEach(log => {
    const day = new Date(log.date).toLocaleDateString();
    if (!summary[day]) summary[day] = {};
    if (!summary[day][log.project]) summary[day][log.project] = 0;
    summary[day][log.project] += log.duration;
  });

  summaryDiv.innerHTML = "";
  Object.keys(summary).forEach(day => {
    const dayDiv = document.createElement("div");
    dayDiv.innerHTML = `<strong>${day}</strong>`;
    Object.entries(summary[day]).forEach(([proj, dur]) => {
      const p = document.createElement("p");
      p.textContent = `${proj}: ${toDecimalHours(dur)} h`;
      dayDiv.appendChild(p);
    });
    summaryDiv.appendChild(dayDiv);
  });
};

document.getElementById("startBtn").addEventListener("click", () => {
  const name = projectNameInput.value.trim() || projectDropdown.value;
  if (!name) return alert("Bitte gib ein Projekt an.");
  if (runningProject && runningProject !== name) {
    const proceed = confirm(`Das Projekt "${runningProject}" läuft bereits. Möchtest du wirklich parallel "${name}" starten?`);
    if (!proceed) return;
  }
  runningProject = name;
  saveProject(name);
  startTime = Date.now();
  timer = setInterval(upda
