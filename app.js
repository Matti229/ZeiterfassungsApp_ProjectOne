let currentUser = localStorage.getItem("loggedInUser");
if (!currentUser) {
  window.location.href = "login.html";
}

document.getElementById("currentUser").textContent = currentUser;

const users = JSON.parse(localStorage.getItem("users"));
let userData = users[currentUser].data || [];

const projectInput = document.getElementById("projectName");
const summaryToday = document.getElementById("summaryToday");
const summaryProjects = document.getElementById("summaryProjects");

let activeProject = null;
let startTime = null;

// Load summaries on start
updateSummaries();

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
});

document.getElementById("startBtn").addEventListener("click", () => {
  const name = projectInput.value.trim();
  if (!name) return alert("Bitte Projektname eingeben.");

  if (activeProject && activeProject !== name) {
    document.getElementById("warningBox").classList.remove("hidden");
    return;
  }

  startProject(name);
});

document.getElementById("confirmParallel").addEventListener("click", () => {
  const name = projectInput.value.trim();
  document.getElementById("warningBox").classList.add("hidden");
  startProject(name);
});

document.getElementById("cancelParallel").addEventListener("click", () => {
  document.getElementById("warningBox").classList.add("hidden");
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  if (!activeProject || !startTime) return;
  stopTracking("pause");
});

document.getElementById("stopBtn").addEventListener("click", () => {
  if (!activeProject || !startTime) return;
  stopTracking("stop");
});

function startProject(name) {
  activeProject = name;
  startTime = new Date();
  alert(`Projekt "${name}" gestartet.`);
}

function stopTracking(type) {
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000; // Sekunden
  const entry = {
    project: activeProject,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    duration,
    date: startTime.toISOString().split("T")[0]
  };

  userData.push(entry);
  users[currentUser].data = userData;
  localStorage.setItem("users", JSON.stringify(users));

  alert(`Projekt "${activeProject}" ${type === "stop" ? "gestoppt" : "pausiert"}.`);
  startTime = null;
  if (type === "stop") activeProject = null;

  updateSummaries();
}

function updateSummaries() {
  const today = new Date().toISOString().split("T")[0];
  const summaryTodayData = {};
  const projectTotals = {};

  userData.forEach((entry) => {
    const durationMin = Math.round(entry.duration / 60);
    if (entry.date === today) {
      summaryTodayData[entry.project] = (summaryTodayData[entry.project] || 0) + durationMin;
    }
    projectTotals[entry.project] = (projectTotals[entry.project] || 0) + durationMin;
  });

  summaryToday.innerHTML = "<h3>Heute</h3>" + Object.entries(summaryTodayData)
    .map(([proj, mins]) => `<p>${proj}: ${Math.floor(mins / 60)}h ${mins % 60}min</p>`)
    .join("") || "<p>Keine Einträge heute.</p>";

  summaryProjects.innerHTML = "<h3>Gesamt pro Projekt</h3>" + Object.entries(projectTotals)
    .map(([proj, mins]) => `<p>${proj}: ${Math.floor(mins / 60)}h ${mins % 60}min</p>`)
    .join("") || "<p>Keine Daten vorhanden.</p>";
}
