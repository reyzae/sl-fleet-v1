// js/input.js
import { supabase } from "./supabaseClient.js";
import { generateReg } from "./regHelper.js";

const form = document.getElementById("addForm");
const hubSelect = document.getElementById("hub");

window.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabase.from("hub").select("prefix");
  if (error) return console.error("Failed to load hubs:", error);

  if (data.length > 0) {
    hubSelect.disabled = false;
    data.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.prefix;
      opt.textContent = h.prefix;
      hubSelect.appendChild(opt);
    });
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    acReg: generateReg("AC"),
    routeReg: generateReg("R"),
    type: form.acType.value,
    manufacturer: form.manufacturer.value,
    category: form.category.value,
    hub: form.hub.value,
    from_icao: form.from.value.split(" ")[0],
    to_icao: form.to.value.split(" ")[0],
    distance: parseInt(form.distance.value),
    Y: parseInt(form.y.value),
    J: parseInt(form.j.value),
    F: parseInt(form.f.value),
    weight: parseFloat(form.weight.value),
    fuel: parseFloat(form.fuel.value)
  };

  const { error } = await supabase.from("fleet").insert(data);
  if (error) {
    alert("Gagal menambahkan pesawat.");
    console.error(error);
  } else {
    alert("Pesawat berhasil ditambahkan!");
    form.reset();
  }
});
