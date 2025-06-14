// js/logout.js

const logoutBtn = document.getElementById("confirmLogout") || document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("fleetData");
    localStorage.removeItem("routeData");
    localStorage.removeItem("historyLogs");
    window.location.href = "index.html";
  });
}
