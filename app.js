let timerInterval;
let startTime;
let currentProject = null;
let isRunning = false;
let elapsed = 0;

const liveTimer = document.getElementById("liveTimer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const projectDropdown = document.getElementById("projectDropdown");
const summaryBody = document.getElementById("summaryBody");
const messageArea = document.getElementById("messageArea");
const newProjectInput = document.getElementById("newProjectInput");
const addProjectBtn = document.getElementById("addProjectBtn");

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatToDecimalHours(ms) {
  return (ms / 3600000).toFixed(2);
}

function updateLiveDisplay() {
  const now = new Date();
  elapsed = now - startTime;
  liveTimer.textContent = formatTime(elapsed);
}

function loadSummary() {
  const data = JSON.parse(localStorage.getItem("timeData") || "[]");
  summaryBody.innerHTML = "";
  data.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.date}</td><td>${entry.project}</td><td>${entry.hours}</td>`;
    summaryBody.appendChild(row);
  });
}

function saveEntry(project, durationMs) {
  const timeData = JSON.parse(localStorage.getItem("timeData") || "[]");
  const today = new Date().toISOString().split("T")[0];
  const hours = parseFloat(formatToDecimalHours(durationMs));
  const existing = timeData.find(e => e.project === project && e.date === today);

  if (existing) {
    existing.hours = (parseFloat(existing.hours) + hours).toFixed(2);
  } else {
    timeData.push({ date: today, project, hours: hours.toFixed(2) });
  }
  localStorage.setItem("timeData", JSON.stringify(timeData));
  loadSummary();
}

function loadProjects() {
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  projectDropdown.innerHTML = '<option value="">-- Projekt wählen --</option>';
  projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    projectDropdown.appendChild(opt);
  });
}

function addProject(name) {
  if (!name) return;
  let projects = JSON.parse(localStorage.getItem("projects") || "[]");
  if (!projects.includes(name)) {
    projects.push(name);
    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
  }
}

addProjectBtn.addEventListener("click", () => {
  const name = newProjectInput.value.trim();
  if (name) {
    addProject(name);
    newProjectInput.value = "";
  }
});

startBtn.addEventListener("click", () => {
  const selected = projectDropdown.value;
  if (!selected) {
    messageArea.textContent = "Bitte zuerst ein Projekt auswählen.";
    return;
  }
  if (isRunning) {
    const confirmParallel = confirm("Ein anderes Projekt läuft bereits. Möchten Sie ein weiteres gleichzeitig starten?");
    if (!confirmParallel) return;
  }
  messageArea.textContent = "";
  currentProject = selected;
  startTime = new Date();
  timerInterval = setInterval(updateLiveDisplay, 1000);
  isRunning = true;
});

pauseBtn.addEventListener("click", () => {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
});

stopBtn.addEventListener("click", () => {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  updateLiveDisplay();
  saveEntry(currentProject, elapsed);
  elapsed = 0;
  liveTimer.textContent = "00:00:00";
});

window.addEventListener("load", () => {
  loadProjects();
  loadSummary();
});
