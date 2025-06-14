// assets/js/fleet.js
import { supabase } from "./auth.js";

// DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  const table = document.getElementById("fleetTable");
  if (!table) return;

  let fleetData = [];
  const tbody = table.querySelector("tbody");

  // 🚀 Fetch fleet data from Supabase
  async function fetchFleet() {
    const { data, error } = await supabase.from("fleet").select("*").order("ac_reg", { ascending: true });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="999">Gagal memuat data fleet.</td></tr>`;
      return;
    }
    fleetData = data;
    renderFleetTable(data);
  }

  // 🔍 Search/Filter
  document.getElementById("fleetSearch")?.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = fleetData.filter((row) => {
      return Object.values(row).some(val => String(val).toLowerCase().includes(keyword));
    });
    renderFleetTable(filtered);
  });

  // ✅ Select All Checkbox
  document.getElementById("selectAll")?.addEventListener("change", (e) => {
    document.querySelectorAll(".row-checkbox").forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  // 🗑️ Bulk Delete
  document.getElementById("deleteSelectedBtn")?.addEventListener("click", async () => {
    const selected = Array.from(document.querySelectorAll(".row-checkbox:checked"))
      .map(cb => cb.value);

    if (selected.length === 0) return alert("Pilih minimal satu pesawat!");
    if (!confirm(`Yakin hapus ${selected.length} fleet?`)) return;

    const { error } = await supabase.from("fleet").delete().in("ac_reg", selected);
    if (error) {
      alert("Gagal menghapus.");
      console.error(error);
    } else {
      alert("Data berhasil dihapus!");
      fetchFleet(); // refresh
    }
  });

  // 📤 Export to CSV
  document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
    const header = ["Reg", "Type", "Manufacturer", "Category", "Hub", "Y", "J", "F", "Weight", "Fuel"];
    const rows = fleetData.map(f => [
      f.ac_reg, f.type, f.manufacturer, f.category, f.hub,
      f.Y || 0, f.J || 0, f.F || 0, f.weight || 0, f.fuel || 0
    ]);

    const csv = [header.join(",")].concat(rows.map(r => r.join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // 📊 Render Table with Edit buttons
  function renderFleetTable(data) {
    tbody.innerHTML = "";

    data.forEach(f => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" value="${f.ac_reg}"></td>
        <td>${f.ac_reg}</td>
        <td>${f.type}</td>
        <td>${f.manufacturer}</td>
        <td>${f.category}</td>
        <td>${f.hub}</td>
        <td>${f.Y}</td>
        <td>${f.J}</td>
        <td>${f.F}</td>
        <td>${f.weight}</td>
        <td>${f.fuel}</td>
        <td><button class="editBtn" data-acreg="${f.ac_reg}">✏️</button></td>
      `;
      tbody.appendChild(row);
    });

    attachSortingHandlers(data);
    attachEditHandlers();
  }

  // 🔃 Auto refresh every 60s
  setInterval(fetchFleet, 60000);

  // ⬆ Sorting logic
  let currentSortField = null;
  let currentSortAsc = true;

  function sortFleetTable(data, field, asc = true) {
    return data.sort((a, b) => {
      const valA = a[field], valB = b[field];
      if (typeof valA === "number" && typeof valB === "number") {
        return asc ? valA - valB : valB - valA;
      }
      return asc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  function attachSortingHandlers(data) {
    const headers = document.querySelectorAll("#fleetTable thead th[data-sort]");
    headers.forEach(th => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const field = th.dataset.sort;
        currentSortAsc = currentSortField === field ? !currentSortAsc : true;
        currentSortField = field;
        const sorted = sortFleetTable([...data], field, currentSortAsc);
        renderFleetTable(sorted);
      });
    });
  }

  // 🛠️ Edit modal handler
  function attachEditHandlers() {
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const acReg = btn.dataset.acreg;
        const { data, error } = await supabase.from("fleet").select("*").eq("ac_reg", acReg).single();
        if (error) return alert("Gagal ambil data untuk edit.");

        const modal = document.getElementById("editModal");
        document.getElementById("edit_acReg").value = data.ac_reg;
        document.getElementById("edit_type").value = data.type;
        document.getElementById("edit_manufacturer").value = data.manufacturer;
        document.getElementById("edit_hub").value = data.hub;
        document.getElementById("edit_fuel").value = data.fuel;

        modal.style.display = "block";
      });
    });

    document.getElementById("editCancel")?.addEventListener("click", () => {
      document.getElementById("editModal").style.display = "none";
    });

    document.getElementById("editForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const acReg = document.getElementById("edit_acReg").value;
      const updates = {
        type: document.getElementById("edit_type").value,
        manufacturer: document.getElementById("edit_manufacturer").value,
        hub: document.getElementById("edit_hub").value,
        fuel: parseFloat(document.getElementById("edit_fuel").value)
      };
      const { error } = await supabase.from("fleet").update(updates).eq("ac_reg", acReg);
      if (error) {
        alert("Gagal update data.");
      } else {
        alert("Data berhasil diupdate!");
        document.getElementById("editModal").style.display = "none";
        fetchFleet();
      }
    });
  }

  fetchFleet(); // initial render
});
