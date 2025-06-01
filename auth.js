const usersKey = "zeiterfassung_users";
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || {};
}

function saveUser(username, password) {
  const users = getUsers();
  if (users[username]) return false;
  users[username] = { password };
  localStorage.setItem(usersKey, JSON.stringify(users));
  return true;
}

function validateLogin(username, password) {
  const users = getUsers();
  return users[username] && users[username].password === password;
}

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    if (validateLogin(username, password)) {
      localStorage.setItem("loggedInUser", username);
      window.location.href = "index.html";
    } else {
      alert("Falscher Benutzername oder Passwort.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;

    if (!username || !password) {
      alert("Bitte Benutzername und Passwort angeben.");
      return;
    }

    if (saveUser(username, password)) {
      alert("Registrierung erfolgreich. Du kannst dich nun einloggen.");
      registerForm.reset();
    } else {
      alert("Benutzername existiert bereits.");
    }
  });
}
