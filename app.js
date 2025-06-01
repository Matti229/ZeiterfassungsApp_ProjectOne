let projects = {}; // Holds active projects with timers

const liveTimerContainer = document.getElementById("liveTimerContainer");
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

function updateProjectTimer(project) {
  const now = new Date();
  const elapsed = now - projects[project].startTime;
  projects[project].elapsed = elapsed;
  const timerSpan = document.getElementById(`timer-${project}`);
  if (timerSpan) timerSpan.textContent = formatTime(elapsed);
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
  const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
  projectDropdown.innerHTML = '<option value="">-- Projekt wählen --</option>';
  savedProjects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    projectDropdown.appendChild(opt);
  });
}

function addProject(name) {
  if (!name) return;
  let savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
  if (!savedProjects.includes(name)) {
    savedProjects.push(name);
    localStorage.setItem("projects", JSON.stringify(savedProjects));
    loadProjects();
  }
}

function createProjectDisplay(project) {
  const existing = document.getElementById(`project-${project}`);
  if (existing) return;

  const div = document.createElement("div");
  div.className = "project-timer";
  div.id = `project-${project}`;

  const title = document.createElement("h3");
  title.textContent = project;

  const timer = document.createElement("span");
  timer.id = `timer-${project}`;
  timer.textContent = "00:00:00";

  const pauseBtn = document.createElement("button");
  pauseBtn.innerHTML = '<img src="icons/pause.png" alt="Pause">';
  pauseBtn.addEventListener("click", () => pauseProject(project));

  const stopBtn = document.createElement("button");
  stopBtn.innerHTML = '<img src="icons/stop.png" alt="Stop">';
  stopBtn.addEventListener("click", () => stopProject(project));

  div.appendChild(title);
  div.appendChild(timer);
  div.appendChild(pauseBtn);
  div.appendChild(stopBtn);

  liveTimerContainer.appendChild(div);
}

function startProject(project) {
  if (!project) {
    messageArea.textContent = "Bitte ein Projekt auswählen.";
    return;
  }

  if (!projects[project]) {
    createProjectDisplay(project);
    projects[project] = {
      startTime: new Date(),
      interval: setInterval(() => updateProjectTimer(project), 1000),
      elapsed: 0,
      isRunning: true
    };
  } else if (!projects[project].isRunning) {
    projects[project].startTime = new Date(new Date() - projects[project].elapsed);
    projects[project].interval = setInterval(() => updateProjectTimer(project), 1000);
    projects[project].isRunning = true;
  }
  messageArea.textContent = "";
}

function pauseProject(project) {
  if (projects[project] && projects[project].isRunning) {
    clearInterval(projects[project].interval);
    projects[project].isRunning = false;
  }
}

function stopProject(project) {
  if (projects[project]) {
    clearInterval(projects[project].interval);
    saveEntry(project, projects[project].elapsed);
    delete projects[project];
    const el = document.getElementById(`project-${project}`);
    if (el) el.remove();
  }
}

addProjectBtn.addEventListener("click", () => {
  const name = newProjectInput.value.trim();
  if (name) {
    addProject(name);
    newProjectInput.value = "";
  }
});

document.getElementById("startBtn").addEventListener("click", () => {
  const selected = projectDropdown.value;
  startProject(selected);
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.parse(localStorage.getItem("timeData") || "[]");
  let csv = "Datum,Projekt,Stunden\n";
  data.forEach(entry => {
    csv += `${entry.date},${entry.project},${entry.hours}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "zeiterfassung.csv";
  link.click();
});

window.addEventListener("load", () => {
  loadProjects();
  loadSummary();
});
