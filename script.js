// script.js

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://hyvohdgugjuurugvwyrg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dm9oZGd1Z2p1dXJ1Z3Z3eXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUwNTcsImV4cCI6MjA2NTQ1MTA1N30.9M5aPVXwXpD8Y0FtWszyubTN6TUZ_Yi1Ff-uhigCvYE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === GLOBAL RENDERING ===
document.addEventListener("DOMContentLoaded", async () => {
  let { data: fleetData, error: fleetErr } = await supabase.from("fleet").select("*");
  let { data: routeData, error: routeErr } = await supabase.from("routes").select("*");

  if (fleetErr || routeErr) {
    console.error("Failed to load data:", fleetErr || routeErr);
    fleetData = JSON.parse(localStorage.getItem("fleetData")) || [];
    routeData = JSON.parse(localStorage.getItem("routeData")) || [];
  } else {
    localStorage.setItem("fleetData", JSON.stringify(fleetData));
    localStorage.setItem("routeData", JSON.stringify(routeData));
  }

  // Update dashboard stats (if exist)
  if (document.getElementById("fleetCount")) {
    document.getElementById("fleetCount").textContent = fleetData.length;
    document.getElementById("routeCount").textContent = routeData.length;
    document.getElementById("hubCount").textContent = new Set(fleetData.map(d => d.hub)).size;

    const activeReg = routeData.map(r => r.acReg);
    const idleFleet = fleetData.filter(f => !activeReg.includes(f.acReg));
    document.getElementById("idleCount").textContent = idleFleet.length;

    renderCharts(fleetData, routeData, idleFleet); // render dashboard charts
  }

  if (document.getElementById("hubTable")) {
    renderHubTable();
  }

  // ⬇️ Tambahin fitur baru di sini misal render history, import, dll
});

// === DASHBOARD CHARTS ===
function renderCharts(fleetData, routeData, idleFleet) {
  // Chart 1: Kategori Pesawat
  const categoryMap = {};
  fleetData.forEach(f => {
    categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
  });
  new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{
        label: "Jumlah",
        data: Object.values(categoryMap),
        backgroundColor: ["#38bdf8", "#0ea5e9"]
      }]
    }
  });

  // Chart 2: Utilisasi Fleet
  new Chart(document.getElementById("utilChart"), {
    type: "pie",
    data: {
      labels: ["Aktif", "Idle"],
      datasets: [{
        label: "Utilisasi",
        data: [fleetData.length - idleFleet.length, idleFleet.length],
        backgroundColor: ["#16a34a", "#ef4444"]
      }]
    }
  });

  // Chart 3: Kapasitas per Hub
  const hubCapMap = {};
  fleetData.forEach(f => {
    const cap = (parseInt(f.Y || 0) || 0) + (parseInt(f.J || 0) || 0) + (parseInt(f.F || 0) || 0);
    hubCapMap[f.hub] = (hubCapMap[f.hub] || 0) + cap;
  });
  new Chart(document.getElementById("hubChart"), {
    type: "pie",
    data: {
      labels: Object.keys(hubCapMap),
      datasets: [{
        label: "Kapasitas",
        data: Object.values(hubCapMap),
        backgroundColor: ["#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#34d399"]
      }]
    }
  });

  // Chart 4: Top 5 Aircraft by Capacity
  const capPerAircraft = fleetData.map(f => {
    const totalCap = (parseInt(f.Y || 0) || 0) + (parseInt(f.J || 0) || 0) + (parseInt(f.F || 0) || 0);
    return { type: f.type || "Unknown", cap: totalCap };
  });
  capPerAircraft.sort((a, b) => b.cap - a.cap);
  const top5 = capPerAircraft.slice(0, 5);
  new Chart(document.getElementById("topAircraftChart"), {
    type: "bar",
    data: {
      labels: top5.map(d => d.type),
      datasets: [{
        label: "Total Capacity",
        data: top5.map(d => d.cap),
        backgroundColor: "#3b82f6"
      }]
    }
  });

  // Chart 5: Jumlah Route per Tipe Pesawat
  const routeCountMap = {};
  routeData.forEach(r => {
    const aircraft = fleetData.find(f => f.acReg === r.acReg);
    if (aircraft) {
      routeCountMap[aircraft.type] = (routeCountMap[aircraft.type] || 0) + 1;
    }
  });
  new Chart(document.getElementById("routeTypeChart"), {
    type: "bar",
    data: {
      labels: Object.keys(routeCountMap),
      datasets: [{
        label: "Jumlah Route",
        data: Object.values(routeCountMap),
        backgroundColor: "#f59e0b"
      }]
    },
    options: {
      indexAxis: 'y'
    }
  });
}

// === HUB TABLE RENDERING ===
export async function renderHubTable() {
  const hubTable = document.getElementById("hubTable");
  if (!hubTable) return;

  const { data: fleetData, error } = await supabase.from("fleet").select("*");
  if (error) {
    console.error("Error fetching fleet data:", error);
    return;
  }

  const hubMap = {};

  fleetData.forEach(f => {
    const hub = f.hub;
    const cap = (parseInt(f.Y || 0) || 0) + (parseInt(f.J || 0) || 0) + (parseInt(f.F || 0) || 0);
    if (!hubMap[hub]) {
      hubMap[hub] = { count: 0, capacity: 0 };
    }
    hubMap[hub].count++;
    hubMap[hub].capacity += cap;
  });

  const ICAO_CITY = {
    PK: { icao: "WIII", city: "Jakarta" },
    "9V": { icao: "WSSS", city: "Singapore" },
    D: { icao: "EDDF", city: "Frankfurt" },
    N: { icao: "KSFO", city: "San Francisco" },
    HZ: { icao: "OEMA", city: "Medina" },
  };

  let i = 1;
  Object.entries(hubMap).forEach(([hub, info]) => {
    const row = document.createElement("tr");
    const { icao, city } = ICAO_CITY[hub] || { icao: "-", city: "Unknown" };

    row.innerHTML = `
      <td>${i++}</td>
      <td>${hub}</td>
      <td>${icao}</td>
      <td>${city}</td>
      <td>${info.count}</td>
      <td>${info.capacity}</td>
    `;
    hubTable.appendChild(row);
  });
}

// === UTILITY & TEMPLATE FOR FUTURE ===
// export async function renderHistoryTable() { ... }
// Fungsi untuk menampilkan log riwayat
export async function renderHistory() {
  const historyTable = document.getElementById("historyTable");
  if (!historyTable) return;

  let logs = JSON.parse(localStorage.getItem("historyLogs")) || [];

  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${log.date}</td>
      <td>${log.action}</td>
      <td>${log.details}</td>
    `;
    historyTable.appendChild(row);
  });
}

// Panggil otomatis kalau halaman history
if (window.location.pathname.includes("history.html")) {
  document.addEventListener("DOMContentLoaded", renderHistory);
}

function addHistoryLog(action, details) {
  const logs = JSON.parse(localStorage.getItem("historyLogs")) || [];
  logs.push({
    date: new Date().toLocaleString(),
    action,
    details
  });
  localStorage.setItem("historyLogs", JSON.stringify(logs));
}

// export async function handleImportFile() { ... }
if (window.location.pathname.includes("import.html")) {
  document.getElementById("importForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) return alert("Pilih file CSV terlebih dahulu!");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const imported = results.data.map((row) => ({
          acReg: row.acReg,
          type: row.type,
          manufacturer: row.manufacturer,
          category: row.category,
          hub: row.hub,
          Y: parseInt(row.Y || 0),
          J: parseInt(row.J || 0),
          F: parseInt(row.F || 0),
          weight: parseFloat(row.weight || 0),
          fuel: parseFloat(row.fuel || 0)
        }));

        const { data, error } = await supabase.from("fleet").insert(imported);
        if (error) {
          console.error(error);
          alert("Gagal mengimpor data.");
        } else {
          alert("Berhasil mengimpor data!");
          localStorage.setItem("fleetData", JSON.stringify(imported));
          addHistoryLog("Import CSV", `Imported ${imported.length} aircraft(s)`);
          window.location.href = "fleet.html";
        }
      },
    });
  });
}

// Render report & export ke PDF 
if (window.location.pathname.includes("report.html")) {
  renderReportTable();
}

async function renderReportTable() {
  const reportTable = document.getElementById("reportTable");
  if (!reportTable) return;

  const { data: fleetData, error } = await supabase.from("fleet").select("*");
  if (error) {
    console.error("Error loading report:", error);
    return;
  }

  fleetData.forEach(f => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${f.acReg}</td>
      <td>${f.type}</td>
      <td>${f.manufacturer}</td>
      <td>${f.category}</td>
      <td>${f.hub}</td>
      <td>${f.Y || 0}</td>
      <td>${f.J || 0}</td>
      <td>${f.F || 0}</td>
      <td>${f.weight || 0}</td>
      <td>${f.fuel || 0}</td>
    `;
    reportTable.appendChild(row);
  });
}

window.downloadPDF = async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Sundaero Line Fleet Report", 10, 10);

  const res = await supabase.from("fleet").select("*");
  const fleet = res.data || [];

  const rows = fleet.map(f => [
    f.acReg, f.type, f.manufacturer, f.category, f.hub,
    f.Y || 0, f.J || 0, f.F || 0, f.weight || 0, f.fuel || 0
  ]);

  doc.autoTable({
    head: [["AC Reg", "Type", "Manufacturer", "Category", "Hub", "Y", "J", "F", "Weight", "Fuel"]],
    body: rows,
    startY: 20
  });

  doc.save("sundaero_fleet_report.pdf");
};

// export async function submitNewAircraft(data) { ... }
// ⬆️ Tambah fungsionalitas lain di sini ya bro
