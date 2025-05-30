let startTime = null;
let timerInterval = null;
let elapsedTime = 0;
let logs = [];

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateDisplay() {
  const now = Date.now();
  const diff = elapsedTime + (startTime ? now - startTime : 0);
  document.getElementById("timer").textContent = formatTime(diff);
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
    timerInterval = setInterval(updateDisplay, 1000);
  }
}

function pauseTimer() {
  if (startTime) {
    elapsedTime += Date.now() - startTime;
    clearInterval(timerInterval);
    startTime = null;
  }
}

function stopTimer() {
  if (startTime || elapsedTime > 0) {
    pauseTimer();
    const duration = elapsedTime;
    const project = getCurrentProject();
    const entry = {
      project,
      duration: formatTime(duration),
      timestamp: new Date().toLocaleString()
    };
    logs.push(entry);
    renderLog();
    elapsedTime = 0;
    updateDisplay();
  }
}

function renderLog() {
  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.timestamp} – ${log.project}: ${log.duration}`;
    logList.appendChild(li);
  });
}

function exportCSV() {
  const csvContent = "data:text/csv;charset=utf-8," +
    "Zeitpunkt,Projekt,Dauer\n" +
    logs.map(log => `${log.timestamp},${log.project},${log.duration}`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "zeiterfassung.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function addProject() {
  const input = document.getElementById("projectInput");
  const name = input.value.trim();
  const select = document.getElementById("projectSelect");

  if (name && ![...select.options].some(opt => opt.value === name)) {
    const option = document.createElement("option");
    option.text = name;
    option.value = name;
    select.add(option);
    input.value = "";
  }
}

function getCurrentProject() {
  const select = document.getElementById("projectSelect");
  return select?.value || "Unbenannt";
}
