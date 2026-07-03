const CACHE='walkman-v7';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  // NETWORK-FIRST for the page itself: updates show up immediately, cache is offline fallback
  if(req.mode==='navigate' || req.destination==='document'){
    e.respondWith(
      fetch(req).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});
        return r;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  // cache-first for icons/manifest
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
