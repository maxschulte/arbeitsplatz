/* Service Worker für Arbeitsplatz mobil: hält die App für die Offline-Nutzung bereit.
   Enthält und speichert keine Daten aus den Tools – die liegen in der IndexedDB der App.
   Bei Änderungen an dieser Datei, den Schriften oder Icons VERSION erhöhen. */
var VERSION = "2026-10-09-1";
var CACHE = "arbeitsplatz-mobil-" + VERSION;
var FILES = [
  "./", "index.html", "manifest.webmanifest",
  "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "fonts/fonts.css",
  "fonts/source-serif-4-latin-500-normal.woff2", "fonts/source-serif-4-latin-600-normal.woff2",
  "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2",
  "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("arbeitsplatz-mobil-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Seite selbst: zuerst aus dem Netz (damit Updates sofort ankommen), sonst aus dem Speicher.
// Alles andere: zuerst aus dem Speicher.
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put("index.html", copy); });
      return res;
    }).catch(function () { return caches.match("index.html"); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req); }));
});
