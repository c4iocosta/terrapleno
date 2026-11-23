// Guarda o app no aparelho para abrir sem internet.
const CACHE='terrapleno-v5';
const LOGO='https://static.wixstatic.com/media/bd40cc_257e0fc23f794f808a9e45057b28eb8c~mv2.png/v1/fill/w_240,h_72,al_c,q_90/logo.png';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all([
  c.addAll(FILES.map(f=>new Request(f,{cache:'reload'}))),
  fetch(LOGO,{mode:'no-cors'}).then(r=>c.put(LOGO,r)).catch(()=>{})])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  const url=e.request.url,same=new URL(url).origin===location.origin;
  // logo da empresa: usa a cópia guardada (funciona sem sinal)
  if(url===LOGO){e.respondWith(caches.match(LOGO).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(CACHE).then(c=>c.put(LOGO,cp));return x})));return}
  // com sinal: sempre confere a versão mais nova no servidor; sem sinal: usa a cópia guardada
  const req=same?fetch(url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request);
  e.respondWith(req.then(r=>{if(r.ok&&same){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r})
   .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))))});
