// app.js

let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser) {
  window.location.href = "login.html";
}

let startTime = null;
let pauseStart = null;
let pausedDuration = 0;
let timerInterval = null;
let currentProject = "";
let activeEntries = [];
let allProjects = new Set(JSON.parse(localStorage.getItem(`${currentUser}_projects`) || "[]"));

// DOM Elements
const projectInput = document.getElementById("projectNameInput");
const projectDropdown = document.getElementById("projectDropdown");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const logoutBtn = document.getElementById("logoutBtn");
const liveTimer = document.getElementById("liveTimer");
const messageArea = document.getElementById("messageArea");
const summaryBody = document.getElementById("summaryBody");

// Load Projects
function loadProjectDropdown() {
  projectDropdown.innerHTML = '<option value="">— Projekt auswählen —</option>';
  allProjects.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    projectDropdown.appendChild(opt);
  });
}
loadProjectDropdown();

// Handle project input
projectInput.addEventListener("change", () => {
  const name = projectInput.value.trim();
  if (name && !allProjects.has(name)) {
    allProjects.add(name);
    localStorage.setItem(`${currentUser}_projects`, JSON.stringify([...allProjects]));
    loadProjectDropdown();
  }
});

// Get selected project
function getSelectedProject() {
  return projectInput.value.trim() || projectDropdown.value;
}

// Timer functions
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function convertToDecimalHours(ms) {
  return (ms / 3600000).toFixed(2);
}

function updateLiveDisplay() {
  if (startTime) {
    const now = new Date();
    const elapsed = now - startTime - pausedDuration;
    liveTimer.textContent = formatTime(elapsed);
  }
}

// Start
startBtn.addEventListener("click", () => {
  if (startTime) {
    alert("Ein Projekt läuft bereits.");
    return;
  }

  const project = getSelectedProject();
  if (!project) {
    alert("Bitte ein Projekt auswählen oder eingeben.");
    return;
  }

  if (activeEntries.length > 0 && !confirm("Ein anderes Projekt läuft bereits. Trotzdem starten?")) {
    return;
  }

  currentProject = project;
  startTime = new Date();
  pausedDuration = 0;
  timerInterval = setInterval(updateLiveDisplay, 1000);

  activeEntries.push({ project, startTime });
  messageArea.textContent = `Projekt "${project}" gestartet.`;
});

// Pause
pauseBtn.addEventListener("click", () => {
  if (!startTime || pauseStart) return;
  pauseStart = new Date();
  clearInterval(timerInterval);
  messageArea.textContent = `Pausiert.`;
});

// Resume (same button)
pauseBtn.addEventListener("dblclick", () => {
  if (!pauseStart) return;
  pausedDuration += new Date() - pauseStart;
  pauseStart = null;
  timerInterval = setInterval(updateLiveDisplay, 1000);
  messageArea.textContent = `Fortgesetzt.`;
});

// Stop
stopBtn.addEventListener("click", () => {
  if (!startTime) return;

  const endTime = new Date();
  const duration = endTime - startTime - pausedDuration;
  const dateKey = new Date().toISOString().split("T")[0];

  // Load existing data
  const dataKey = `${currentUser}_data`;
  const storedData = JSON.parse(localStorage.getItem(dataKey) || "{}");

  if (!storedData[dateKey]) {
    storedData[dateKey] = {};
  }

  if (!storedData[dateKey][currentProject]) {
    storedData[dateKey][currentProject] = 0;
  }

  storedData[dateKey][currentProject] += duration;
  localStorage.setItem(dataKey, JSON.stringify(storedData));

  clearInterval(timerInterval);
  liveTimer.textContent = "00:00:00";
  messageArea.textContent = `Gestoppt: ${currentProject} (${convertToDecimalHours(duration)} h)`;

  // Reset
  startTime = null;
  pauseStart = null;
  pausedDuration = 0;
  activeEntries = [];

  updateSummary();
});

// Zusammenfassung laden
function updateSummary() {
  const data = JSON.parse(localStorage.getItem(`${currentUser}_data`) || "{}");
  summaryBody.innerHTML = "";

  Object.entries(data).forEach(([date, projects]) => {
    Object.entries(projects).forEach(([project, time]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${date}</td>
        <td>${project}</td>
        <td>${convertToDecimalHours(time)}</td>
      `;
      summaryBody.appendChild(tr);
    });
  });
}
updateSummary();

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
});
