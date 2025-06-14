// js/hub-management.js
import { supabase } from "./supabaseClient.js";

const form = document.getElementById("hubForm");
const table = document.getElementById("hubTable");

async function loadHubs() {
  table.innerHTML = "";
  const { data, error } = await supabase.from("hub").select("*");
  if (error) return console.error("Gagal memuat data hub:", error);

  data.forEach(h => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${h.prefix}</td>
      <td>${h.name}</td>
      <td>
        <button onclick="deleteHub('${h.prefix}')">🗑️ Hapus</button>
      </td>
    `;
    table.appendChild(row);
  });
}

window.deleteHub = async (prefix) => {
  if (!confirm("Yakin ingin menghapus hub?")) return;
  const { error } = await supabase.from("hub").delete().eq("prefix", prefix);
  if (error) return alert("Gagal menghapus hub.");
  loadHubs();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prefix = document.getElementById("prefix").value.toUpperCase();
  const name = document.getElementById("name").value;

  const { error } = await supabase.from("hub").upsert({ prefix, name });
  if (error) {
    alert("Gagal menyimpan hub");
    return;
  }
  form.reset();
  loadHubs();
});

window.addEventListener("DOMContentLoaded", loadHubs);
