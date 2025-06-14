// assets/js/fleet.js
import { supabase } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const table = document.getElementById("fleetTable");
  if (!table) return;

  const { data: fleetData, error } = await supabase.from("fleet").select("*").order("ac_reg", { ascending: true });
  if (error) {
    table.innerHTML = `<tr><td colspan="10">Gagal load data fleet.</td></tr>`;
    return;
  }

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  fleetData.forEach(f => {
    tbody.innerHTML += `
      <tr>
        <td>${f.ac_reg}</td>
        <td>${f.type}</td>
        <td>${f.manufacturer}</td>
        <td>${f.category}</td>
        <td>${f.hub}</td>
        <td>${f.Y || 0}</td>
        <td>${f.J || 0}</td>
        <td>${f.F || 0}</td>
        <td>${f.weight || 0}</td>
        <td>${f.fuel || 0}</td>
      </tr>
    `;
  });







  // 🔍 Search/filter logic
  const searchInput = document.getElementById("fleetSearch");
  searchInput?.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const rows = tbody.querySelectorAll("tr");
    rows.forEach(row => {
      const rowText = row.innerText.toLowerCase();
      row.style.display = rowText.includes(keyword) ? "" : "none";
    });
  });
});


function exportFleetToCSV() {
  const rows = Array.from(document.querySelectorAll("#fleetTable tbody tr"));
  if (rows.length === 0) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const header = ["Reg", "Type", "Manufacturer", "Category", "Hub", "Y", "J", "F", "Weight", "Fuel"];
  const csvContent = [header.join(",")];

  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll("td")).map(td => `"${td.textContent.trim()}"`);
    csvContent.push(cols.join(","));
  });

  const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fleet_export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

  const exportBtn = document.getElementById("exportCsvBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportFleetToCSV);
  }





// Sorting Logic 

let currentSortField = null;
let currentSortAsc = true;

function sortFleetTable(data, field, asc = true) {
  return data.sort((a, b) => {
    const valA = a[field];
    const valB = b[field];

    if (typeof valA === "number" && typeof valB === "number") {
      return asc ? valA - valB : valB - valA;
    }

    return asc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });
}

function attachSortingHandlers(data) {
  const headers = document.querySelectorAll("#fleetTable thead th");

  headers.forEach((th) => {
    const field = th.dataset.sort;
    if (!field) return;

    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      currentSortAsc = currentSortField === field ? !currentSortAsc : true;
      currentSortField = field;

      const sorted = sortFleetTable([...data], field, currentSortAsc);
      renderFleetTable(sorted);
    });
  });
}

// Render Table Function Sorting

function renderFleetTable(data) {
  const tbody = document.querySelector("#fleetTable tbody");
  tbody.innerHTML = "";

  data.forEach((f) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${f.acReg}</td>
      <td>${f.type}</td>
      <td>${f.manufacturer}</td>
      <td>${f.category}</td>
      <td>${f.hub}</td>
      <td>${f.Y}</td>
      <td>${f.J}</td>
      <td>${f.F}</td>
      <td>${f.weight}</td>
      <td>${f.fuel}</td>
    `;
    tbody.appendChild(row);
  });

  attachSortingHandlers(data);
}
