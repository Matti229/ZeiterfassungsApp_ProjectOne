// Lokale Benutzerdaten verwalten (LocalStorage)

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username] && users[username].password === password) {
    // Login erfolgreich
    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html";
  } else {
    alert("Falscher Benutzername oder Passwort");
  }
});

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username]) {
    alert("Benutzername bereits vergeben");
  } else {
    users[username] = { password: password, data: [] };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registrierung erfolgreich! Jetzt einloggen.");
  }

  document.getElementById("registerForm").reset();
});
