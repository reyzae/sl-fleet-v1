// js/history.js

const tableBody = document.querySelector("#historyTable tbody");

function loadHistory() {
  const logs = JSON.parse(localStorage.getItem("historyLogs")) || [];

  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${log.date}</td>
      <td>${log.action}</td>
      <td>${log.details}</td>
    `;
    tableBody.appendChild(row);
  });
}

window.addEventListener("DOMContentLoaded", loadHistory);
