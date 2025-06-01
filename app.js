// app.js

let activeTimers = {}; // { projectName: {start, elapsed, interval, running} }

const projectInput = document.getElementById('newProjectInput');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectDropdown = document.getElementById('projectDropdown');
const startBtn = document.getElementById('startBtn');
const liveTimerContainer = document.getElementById('liveTimerContainer');
const summaryBody = document.getElementById('summaryBody');
const exportBtn = document.getElementById('exportBtn');
const messageArea = document.getElementById('messageArea');

const username = localStorage.getItem('username') || 'gast';

// Load stored data
let storedProjects = JSON.parse(localStorage.getItem(`${username}_projects`)) || [];
let storedEntries = JSON.parse(localStorage.getItem(`${username}_entries`)) || [];

// Initialize UI
displayProjects();
displaySummary();

addProjectBtn.addEventListener('click', () => {
  const projectName = projectInput.value.trim();
  if (projectName && !storedProjects.includes(projectName)) {
    storedProjects.push(projectName);
    localStorage.setItem(`${username}_projects`, JSON.stringify(storedProjects));
    projectInput.value = '';
    displayProjects();
  }
});

startBtn.addEventListener('click', () => {
  const projectName = projectDropdown.value;
  if (!projectName) return;

  if (activeTimers[projectName]) {
    messageArea.textContent = 'Projekt läuft bereits!';
    return;
  }

  messageArea.textContent = '';

  let start = Date.now();
  let elapsed = 0;
  let running = true;

  const timerElement = document.createElement('div');
  timerElement.className = 'timer-card';

  const timerInfo = document.createElement('div');
  timerInfo.className = 'timer-info';
  timerInfo.textContent = `${projectName}: 00:00:00`;

  const pauseBtn = document.createElement('button');
  pauseBtn.innerHTML = '<img src="icons/pause.png" alt="Pause">';

  const stopBtn = document.createElement('button');
  stopBtn.innerHTML = '<img src="icons/stop.png" alt="Stop">';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'timer-buttons';
  btnGroup.append(pauseBtn, stopBtn);

  timerElement.append(timerInfo, btnGroup);
  liveTimerContainer.appendChild(timerElement);

  const interval = setInterval(() => {
    if (running) {
      const total = Date.now() - start + elapsed;
      timerInfo.textContent = `${projectName}: ${formatTime(total)}`;
    }
  }, 1000);

  pauseBtn.addEventListener('click', () => {
    if (running) {
      elapsed += Date.now() - start;
      running = false;
      pauseBtn.innerHTML = '<img src="icons/start.png" alt="Start">';
    } else {
      start = Date.now();
      running = true;
      pauseBtn.innerHTML = '<img src="icons/pause.png" alt="Pause">';
    }
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(interval);
    const totalTime = running ? elapsed + Date.now() - start : elapsed;
    storeEntry(projectName, totalTime);
    delete activeTimers[projectName];
    timerElement.remove();
    displaySummary();
  });

  activeTimers[projectName] = { start, elapsed, interval, running };
});

function storeEntry(project, time) {
  const date = new Date().toLocaleDateString('de-DE');
  storedEntries.push({ project, time, date });
  localStorage.setItem(`${username}_entries`, JSON.stringify(storedEntries));
}

function displaySummary() {
  const summaryMap = {};
  for (const entry of storedEntries) {
    const key = `${entry.date}-${entry.project}`;
    summaryMap[key] = (summaryMap[key] || 0) + entry.time;
  }

  summaryBody.innerHTML = '';
  Object.keys(summaryMap).forEach(key => {
    const [date, project] = key.split('-');
    const hours = (summaryMap[key] / 3600000).toFixed(2);
    const row = `<tr><td>${date}</td><td>${project}</td><td>${hours}</td></tr>`;
    summaryBody.insertAdjacentHTML('beforeend', row);
  });
}

function displayProjects() {
  projectDropdown.innerHTML = '<option value="">Projekt wählen</option>';
  storedProjects.forEach(project => {
    const opt = document.createElement('option');
    opt.value = project;
    opt.textContent = project;
    projectDropdown.appendChild(opt);
  });
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

exportBtn.addEventListener('click', () => {
  let csv = 'Datum,Projekt,Stunden\n';
  for (const entry of storedEntries) {
    const hours = (entry.time / 3600000).toFixed(2);
    csv += `${entry.date},${entry.project},${hours}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zeiten.csv';
  a.click();
  URL.revokeObjectURL(url);
});
