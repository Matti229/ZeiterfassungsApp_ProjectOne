// auth.js

function isLoggedIn() {
  return !!localStorage.getItem("loggedInUser");
}

function redirectToLoginIfNotLoggedIn() {
  if (!isLoggedIn() && window.location.pathname.endsWith("index.html")) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function getCurrentUser() {
  return localStorage.getItem("loggedInUser");
}

function login(username, password) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username] && users[username] === password) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  } else {
    alert("Login fehlgeschlagen");
  }
}

function register(username, password) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username]) {
    alert("Benutzername bereits vergeben");
  } else {
    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registrierung erfolgreich. Jetzt einloggen.");
    window.location.href = "login.html";
  }
}
