import {migrateLegacy} from './db.js';
try{
  const data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():null);
  if(data)await migrateLegacy((data.lessons||[]).map(l=>l.id),data.masteryIds||[]);
}catch(err){console.warn('Legacy progress migration skipped',err)}
await import('./app.js');
