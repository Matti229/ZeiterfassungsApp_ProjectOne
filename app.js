// app.js – ZeiterfassungsApp

let currentUser = localStorage.getItem("currentUser") || null;
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let activeSessions = JSON.parse(localStorage.getItem("activeSessions")) || {}; // session: {startTime, pausedTime, isRunning}
let timeLogs = JSON.parse(localStorage.getItem("timeLogs")) || {}; // user: {project: [log]}

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const logoutBtn = document.getElementById("logoutBtn");
const projectInput = document.getElementById("projectInput");
const projectSelect = document.getElementById("projectSelect");
const timeDisplay = document.getElementById("timeDisplay");
const summaryContent = document.getElementById("summaryContent");

let interval;

function saveState() {
  localStorage.setItem("projects", JSON.stringify(projects));
  localStorage.setItem("activeSessions", JSON.stringify(activeSessions));
  localStorage.setItem("timeLogs", JSON.stringify(timeLogs));
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hr = Math.floor(ms / 3600000);
  return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function convertToDecimal(ms) {
  return (ms / 3600000).toFixed(2);
}

function updateDropdown() {
  projectSelect.innerHTML = "";
  projects.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    projectSelect.appendChild(option);
  });
}

function renderSummary() {
  if (!currentUser) return;
  const logs = timeLogs[currentUser] || {};
  let summaryHtml = "";
  for (const project in logs) {
    let dailyTotals = {};
    logs[project].forEach(log => {
      const date = new Date(log.date).toLocaleDateString();
      dailyTotals[date] = (dailyTotals[date] || 0) + log.duration;
    });
    summaryHtml += `<h3>${project}</h3>`;
    for (const date in dailyTotals) {
      summaryHtml += `<p>${date}: ${convertToDecimal(dailyTotals[date])} h</p>`;
    }
  }
  summaryContent.innerHTML = summaryHtml || "Keine Einträge.";
}

function startTimer(project) {
  if (!activeSessions[project]) {
    activeSessions[project] = {
      startTime: Date.now(),
      pausedTime: 0,
      isRunning: true
    };
  } else {
    const session = activeSessions[project];
    if (!session.isRunning) {
      session.startTime = Date.now() - session.pausedTime;
      session.isRunning = true;
      session.pausedTime = 0;
    }
  }
  clearInterval(interval);
  interval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - activeSessions[project].startTime;
    timeDisplay.textContent = formatTime(elapsed);
  }, 1000);
  saveState();
}

function pauseTimer(project) {
  const session = activeSessions[project];
  if (session && session.isRunning) {
    session.pausedTime = Date.now() - session.startTime;
    session.isRunning = false;
    clearInterval(interval);
    saveState();
  }
}

function stopTimer(project) {
  const session = activeSessions[project];
  if (session) {
    const duration = session.isRunning ? Date.now() - session.startTime : session.pausedTime;
    const log = { date: new Date(), duration };
    if (!timeLogs[currentUser]) timeLogs[currentUser] = {};
    if (!timeLogs[currentUser][project]) timeLogs[currentUser][project] = [];
    timeLogs[currentUser][project].push(log);
    delete activeSessions[project];
    clearInterval(interval);
    timeDisplay.textContent = "00:00:00";
    saveState();
    renderSummary();
  }
}

startBtn.addEventListener("click", () => {
  const projectName = projectInput.value || projectSelect.value;
  if (!projectName) return alert("Projektname eingeben oder auswählen");
  if (!projects.includes(projectName)) {
    projects.push(projectName);
    updateDropdown();
  }
  const otherRunning = Object.entries(activeSessions).some(([p, s]) => p !== projectName && s.isRunning);
  if (otherRunning && !confirm("Es läuft bereits ein anderes Projekt. Trotzdem fortfahren?")) return;
  startTimer(projectName);
});

pauseBtn.addEventListener("click", () => {
  const projectName = projectInput.value || projectSelect.value;
  if (projectName) pauseTimer(projectName);
});

stopBtn.addEventListener("click", () => {
  const projectName = projectInput.value || projectSelect.value;
  if (projectName) stopTimer(projectName);
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

updateDropdown();
renderSummary();
