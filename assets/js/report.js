// js/report.js
import { supabase } from "./supabaseClient.js";

const tableBody = document.querySelector("#reportTable tbody");
const downloadBtn = document.getElementById("downloadBtn");

async function loadReport() {
  const { data: fleetData, error } = await supabase.from("fleet").select("*");
  if (error) return console.error("Gagal memuat data:", error);

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
    tableBody.appendChild(row);
  });
}

window.addEventListener("DOMContentLoaded", loadReport);

downloadBtn.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Sundaero Line Fleet Report", 14, 14);

  const { data } = await supabase.from("fleet").select("*");
  const rows = data.map(f => [
    f.acReg, f.type, f.manufacturer, f.category, f.hub,
    f.Y || 0, f.J || 0, f.F || 0, f.weight || 0, f.fuel || 0
  ]);

  doc.autoTable({
    startY: 20,
    head: [["AC Reg", "Type", "Manufacturer", "Category", "Hub", "Y", "J", "F", "Weight", "Fuel"]],
    body: rows
  });

  doc.save("sundaero_fleet_report.pdf");
});
