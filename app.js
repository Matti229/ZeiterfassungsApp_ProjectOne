let timer = null;
let startTime = null;
let elapsedTime = 0;
let activeProject = null;
let allowParallel = false;

window.onload = () => {
  loadProjects();
  loadSummary();
};

// Start-Timer
function startTimer() {
  const project = getSelectedProject();
  if (!project) return alert("Bitte ein Projekt auswählen oder hinzufügen.");

  if (activeProject && activeProject !== project && !allowParallel) {
    showWarningBox();
    return;
  }

  if (!activeProject) activeProject = project;

  startTime = Date.now() - elapsedTime;
  timer = setInterval(updateTimerDisplay, 1000);
}

// Pause-Timer
function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    elapsedTime = Date.now() - startTime;
  }
}

// Stop-Timer
function stopTimer() {
  if (!timer && !elapsedTime) return;

  clearInterval(timer);
  const project = activeProject;
  const durationInMs = Date.now() - startTime;
  const durationInHours = durationInMs / (1000 * 60 * 60);
  saveEntry(project, durationInHours);

  resetTimer();
  loadSummary();
}

function resetTimer() {
  timer = null;
  startTime = null;
  elapsedTime = 0;
  activeProject = null;
  allowParallel = false;
  document.getElementById("timerDisplay").innerText = "00:00:00";
}

// Anzeige aktualisieren
function updateTimerDisplay() {
  const diff = Date.now() - startTime;
  const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  document.getElementById("timerDisplay").innerText = `${hours}:${minutes}:${seconds}`;
}

// Neues Projekt hinzufügen
function addNewProject() {
  const input = document.getElementById("newProjectInput");
  const name = input.value.trim();
  if (!name) return;

  const select = document.getElementById("projectSelect");
  const exists = Array.from(select.options).some(opt => opt.value === name);
  if (!exists) {
    const option = new Option(name, name);
    select.add(option);
    saveProject(name);
  }
  input.value = "";
}

// Projekt auswählen
function getSelectedProject() {
  const select = document.getElementById("projectSelect");
  return select.value || document.getElementById("newProjectInput").value.trim();
}

// Projektliste laden
function loadProjects() {
  const saved = JSON.parse(localStorage.getItem("projects") || "[]");
  const select = document.getElementById("projectSelect");
  saved.forEach(name => {
    const option = new Option(name, name);
    select.add(option);
  });
}

// Projekte speichern
function saveProject(name) {
  const saved = JSON.parse(localStorage.getItem("projects") || "[]");
  if (!saved.includes(name)) {
    saved.push(name);
    localStorage.setItem("projects", JSON.stringify(saved));
  }
}

// Zeit-Eintrag speichern
function saveEntry(project, hours) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `entries_${today}`;
  const data = JSON.parse(localStorage.getItem(key) || "{}");

  data[project] = (data[project] || 0) + hours;
  localStorage.setItem(key, JSON.stringify(data));
}

// Tages- & Projekt-Zusammenfassung laden
function loadSummary() {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem(`entries_${today}`) || "{}");

  const summaryToday = document.getElementById("summaryToday");
  const summaryProjects = document.getElementById("summaryProjects");
  summaryToday.innerHTML = `<h3>Heute (${today}):</h3>`;
  summaryProjects.innerHTML = "";

  for (const [project, hours] of Object.entries(data)) {
    const formatted = hours.toFixed(2).replace(".", ",");
    summaryProjects.innerHTML += `<div><strong>${project}:</strong> ${formatted} h</div>`;
  }
}

// Warnbox für parallele Projekte
function showWarningBox() {
  document.getElementById("warningBox").classList.remove("hidden");
}

function confirmParallel(choice) {
  document.getElementById("warningBox").classList.add("hidden");
  allowParallel = choice;
  if (choice) startTimer();
}
