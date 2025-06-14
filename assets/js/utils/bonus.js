// assets/js/utils/bonus.js

export function applySiteMetadata(faviconPath, manifestPath) {
  // Inject favicon
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = faviconPath;
  document.head.appendChild(favicon);

  // Inject manifest
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = manifestPath;
  document.head.appendChild(manifest);
}
