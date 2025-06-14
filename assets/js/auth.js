// js/auth.js

// Manual login credentials
const USERS = [
  { username: "sundaero", password: btoa("sundaero!") },
];

// DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const remember = document.getElementById("rememberMe");

  // Autoload remembered
  if (localStorage.getItem("rememberedUser")) {
    username.value = localStorage.getItem("rememberedUser");
    remember.checked = true;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username.value && u.password === btoa(password.value));

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      if (remember.checked) {
        localStorage.setItem("rememberedUser", username.value);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      window.location.href = "dashboard.html";
    } else {
      alert("Username atau password salah!");
    }
  });

  // Proteksi semua halaman kecuali index.html
  const publicPages = ["index.html", "logout.html"];
  const current = window.location.pathname.split("/").pop();
  if (!publicPages.includes(current) && localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
  }

  // Tambah tombol logout kalau login
  const nav = document.querySelector("nav");
  if (nav && localStorage.getItem("isLoggedIn") === "true") {
    const btn = document.createElement("button");
    btn.textContent = "Logout";
    btn.className = "logout-btn";
    btn.onclick = () => {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "index.html";
    };
    nav.appendChild(btn);
  }
});
