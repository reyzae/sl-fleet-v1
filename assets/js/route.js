// js/route.js
import { supabase } from "./supabaseClient.js";

const tableBody = document.querySelector("#routeTable tbody");

async function loadRoutes() {
  const { data: routeData, error } = await supabase.from("routes").select("*");
  if (error) return console.error("Gagal memuat data rute:", error);

  routeData.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.route_reg}</td>
      <td>${r.ac_reg}</td>
      <td>${r.from_icao}</td>
      <td>${r.to_icao}</td>
      <td>${r.distance} km</td>
    `;
    tableBody.appendChild(row);
  });
}

window.addEventListener("DOMContentLoaded", loadRoutes);
