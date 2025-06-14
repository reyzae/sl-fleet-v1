// common-init.js (paling atas)
document.addEventListener("DOMContentLoaded", async () => {
  // Inject HTML sidebar
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const file = el.getAttribute("data-include");
    const resp = await fetch(file);
    if (resp.ok) {
      el.innerHTML = await resp.text();
    }
  }
});

// assets/js/common-init.js
import { applySiteMetadata } from "./utils/bonus.js";

// Global polish: favicon, manifest, etc.
applySiteMetadata("assets/img/favicon.ico", "assets/data/manifest.json");
