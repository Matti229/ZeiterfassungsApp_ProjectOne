// auth.js

// Benutzer speichern
function saveUser(username, password) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  users[username] = { password };
  localStorage.setItem("users", JSON.stringify(users));
}

// Benutzer prüfen
function authenticateUser(username, password) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  return users[username] && users[username].password === password;
}

// Beim Registrieren
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[username]) {
      alert("Benutzername existiert bereits.");
    } else {
      saveUser(username, password);
      localStorage.setItem("loggedInUser", username);
      alert("Registrierung erfolgreich!");
      window.location.href = "index.html"; // Weiterleitung zur App
    }
  });
}

// Beim Login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (authenticateUser(username, password)) {
      localStorage.setItem("loggedInUser", username);
      alert("Login erfolgreich!");
      window.location.href = "index.html"; // Weiterleitung zur App
    } else {
      alert("Falscher Benutzername oder Passwort.");
    }
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}
