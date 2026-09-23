const root=new URL('../public/',import.meta.url);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};

async function assetFor(pathname){
  if(pathname==='/')return{file:Bun.file(new URL('index.html',root)),ext:'.html'};
  const path=pathname.replace(/^\//,'');
  let file=Bun.file(new URL(path,root));
  if(await file.exists())return{file,ext:path.includes('.')?path.slice(path.lastIndexOf('.')):'.html'};
  if(!path.includes('.')){
    const html=Bun.file(new URL(`${path}.html`,root));
    if(await html.exists())return{file:html,ext:'.html'};
  }
  return{file:Bun.file(new URL('index.html',root)),ext:'.html'};
}

Bun.serve({port:Number(process.env.PORT||4173),async fetch(req){const u=new URL(req.url),asset=await assetFor(u.pathname);return new Response(asset.file,{headers:{'content-type':types[asset.ext]||'application/octet-stream','cache-control':'no-store'}});}});
console.log('Canonical Shelf v7 preview: http://localhost:4173');
