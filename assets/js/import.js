// js/import.js
import { supabase } from "./supabaseClient.js";

const form = document.getElementById("importForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("csvFile").files[0];
  if (!file) return alert("Pilih file CSV terlebih dahulu!");

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const imported = results.data.map(row => ({
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

      const { error } = await supabase.from("fleet").insert(imported);
      if (error) {
        console.error(error);
        alert("Gagal mengimpor data.");
      } else {
        alert("Berhasil mengimpor data!");
        localStorage.setItem("fleetData", JSON.stringify(imported));
        window.location.href = "fleet.html";
      }
    }
  });
});
