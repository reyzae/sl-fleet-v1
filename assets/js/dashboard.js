// js/dashboard.js
import { supabase } from "./supabaseClient.js";

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

  document.getElementById("fleetCount").textContent = fleetData.length;
  document.getElementById("routeCount").textContent = routeData.length;
  document.getElementById("hubCount").textContent = new Set(fleetData.map(f => f.hub)).size;

  const activeReg = routeData.map(r => r.acReg);
  const idleFleet = fleetData.filter(f => !activeReg.includes(f.acReg));
  document.getElementById("idleCount").textContent = idleFleet.length;

  renderCharts(fleetData, routeData, idleFleet);
});

function renderCharts(fleetData, routeData, idleFleet) {
  const categoryMap = {};
  fleetData.forEach(f => categoryMap[f.category] = (categoryMap[f.category] || 0) + 1);

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

  new Chart(document.getElementById("utilChart"), {
    type: "pie",
    data: {
      labels: ["Aktif", "Idle"],
      datasets: [{
        data: [fleetData.length - idleFleet.length, idleFleet.length],
        backgroundColor: ["#16a34a", "#ef4444"]
      }]
    }
  });

  const hubCapMap = {};
  fleetData.forEach(f => {
    const cap = (parseInt(f.Y) || 0) + (parseInt(f.J) || 0) + (parseInt(f.F) || 0);
    hubCapMap[f.hub] = (hubCapMap[f.hub] || 0) + cap;
  });

  new Chart(document.getElementById("hubChart"), {
    type: "pie",
    data: {
      labels: Object.keys(hubCapMap),
      datasets: [{
        data: Object.values(hubCapMap),
        backgroundColor: ["#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#34d399"]
      }]
    }
  });

  const capPerAircraft = fleetData.map(f => {
    const totalCap = (parseInt(f.Y) || 0) + (parseInt(f.J) || 0) + (parseInt(f.F) || 0);
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
    options: { indexAxis: 'y' }
  });
}
