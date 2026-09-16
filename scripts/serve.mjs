const root=new URL('../public/',import.meta.url);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
Bun.serve({port:Number(process.env.PORT||4173),async fetch(req){const u=new URL(req.url);const path=u.pathname==='/'?'index.html':u.pathname.slice(1);let f=Bun.file(new URL(path,root));if(!(await f.exists())) f=Bun.file(new URL('index.html',root));const ext=path.includes('.')?path.slice(path.lastIndexOf('.')):'.html';return new Response(f,{headers:{'content-type':types[ext]||'application/octet-stream','cache-control':'no-store'}});}});
console.log('Canonical Shelf v6 preview: http://localhost:4173');
