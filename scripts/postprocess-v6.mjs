import {readFile,writeFile} from 'node:fs/promises';
import {units,mapLegacyUnit,mapLesson} from './curriculum-map.mjs';
const path='public/data/catalog.json';
const cat=JSON.parse(await readFile(path,'utf8'));
const txt=l=>`${l.id||''} ${l.title||''} ${l.objective||''}`.toLowerCase(),has=(l,re)=>re.test(txt(l));
function v4Unit(l){const old=Number(l.unit)||0;if(old===1){if(has(l,/larger story|story map|biblical story/))return 4;if(has(l,/library|canon|reference|context detective/))return 2;if(has(l,/neighbor|mercy|love/))return 20;return 1}if(old===2){if(has(l,/shelf|seven bible skills|book order|group|genre/))return 3;return 2}if(old===3)return 5;if(old===4){if(has(l,/torah|law|sinai|neighbor responsibility|holiness/))return 7;return 6}if(old===5){if(has(l,/judge|conquest|land|violence/))return 8;if(has(l,/monarch|king|david|solomon|temple/))return 9;if(has(l,/exile|lament|return|rebuild/))return 11;return 10}if(old===6)return 12;if(old===7){if(has(l,/hear the prophets in their own setting|prophetic overview/))return 13;if(has(l,/justice|amos|micah|jeremiah|exilic hope/))return 10;return 13}if(old===8)return 14;if(old===9)return 15;if(old===10){if(has(l,/acts|early church|early christian|pentecost|communal discernment|jerusalem council/))return 16;if(has(l,/james|favoritism|general epistle|general letter/))return 18;if(has(l,/paul|letter|body|belong/))return 17;return 16}if(old===11)return 19;if(old===12)return 20;if(old===13)return 21;if(old===14)return 22;if(old===15)return 23;if(old===16){if(has(l,/theme|argument|comparison/))return 24;return 25}return 1}
cat.units=units;
cat.lessons=cat.lessons.map((l,order)=>{const legacy=v4Unit(l);return {...l,v4Unit:legacy,v6Unit:mapLesson({...l,v4Unit:legacy}),v6Order:order}});
cat.activities=[];
for(const l of cat.lessons)cat.activities.push({id:`lesson:${l.id}`,type:'lesson',unitId:l.v6Unit,title:l.title,sourceId:l.id});
for(const [legacyUnit,ids] of Object.entries(cat.legacyMasteryPlacement))for(const id of ids)cat.activities.push({id:`mastery:${id}`,type:'mastery',unitId:mapLegacyUnit(legacyUnit),title:(cat.legacyMastery?.CANON_V4_MASTERY?.[id]?.title)||id,sourceId:id});
cat.byUnit=Object.fromEntries(units.map(u=>[u.id,cat.activities.filter(a=>a.unitId===u.id).map(a=>a.id)]));
if(cat.activities.length!==139)throw new Error(`expected 139 activities, got ${cat.activities.length}`);
await writeFile(path,JSON.stringify(cat,null,2));
await writeFile('public/data/statement-of-faith.md',await readFile('content/statement/statement-of-faith-v3.md','utf8'));
await writeFile('public/data/theology-sources.json',await readFile('content/theology/sources.json','utf8'));
console.log(`v6 mapped ${cat.lessons.length} lessons + ${cat.masteryIds.length} mastery = ${cat.activities.length} activities`);
