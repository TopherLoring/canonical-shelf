import {courses,units,unitById,courseById} from '../content/curriculum/structure.mjs';

export {courses,units,unitById,courseById};

// Preserve the legacy v4/v7 activity IDs while changing only their curriculum placement.
// This broad placement keeps every one of the 69 existing mastery IDs routable.
const legacyUnitMap={
  1:'c1.christianity',
  2:'c1.reading',
  3:'c1.story',
  4:'c2.exodus',
  5:'c2.land-kings',
  6:'c5.genre',
  7:'c2.prophets-exile',
  8:'c4.gospels',
  9:'c6.sin-salvation',
  10:'c4.pentecost',
  11:'c6.god-christ',
  12:'c6.church-practice',
  13:'c6.traditions',
  14:'c6.difficult',
  15:'c6.final-hope',
  16:'c5.interpretation',
  17:'c4.expansion',
  18:'c4.expansion',
  19:'c6.god-christ',
  20:'c6.church-practice',
  21:'c6.traditions',
  22:'c6.difficult',
  23:'c6.final-hope',
  24:'c5.intertext',
  25:'c5.interpretation'
};

export function mapLegacyUnit(n){return legacyUnitMap[Number(n)]||'c1.christianity'}

const text=lesson=>`${lesson.id||''} ${lesson.title||''} ${lesson.objective||''} ${(lesson.body||[]).join(' ')}`.toLowerCase();
const has=(lesson,re)=>re.test(text(lesson));

/**
 * Map the 70 existing authored guided lessons into the new program.
 * Placement is semantic rather than count-driven; IDs remain unchanged.
 */
export function mapLesson(lesson){
  const old=Number(lesson.v4Unit||lesson.unit)||1;

  if(old===1){
    if(lesson.id==='begin'||has(lesson,/central story|gospel|christian proclamation/))return'c1.christianity';
    if(lesson.id==='library'||has(lesson,/library|canon|reference|book.*chapter|chapter.*verse/))return'c1.bible';
    if(lesson.id==='story'||has(lesson,/larger story|story map|biblical arc/))return'c1.story';
    if(lesson.id==='context'||has(lesson,/context detective|observation|interpretation|application/))return'c1.reading';
    return'c1.christianity';
  }

  if(old===2){
    if(lesson.id==='translation'||has(lesson,/translation difference|manuscript witness|textual variant|textual apparatus/))return'c1.transmission';
    if(has(lesson,/shelf|seven bible skills|book order|group|library|canon/))return'c1.bible';
    if(has(lesson,/genre|context|interpret|application|evidence|observation/))return'c1.reading';
    return'c1.reading';
  }

  if(old===3)return'c1.story';

  if(old===4){
    if(has(lesson,/abraham|promise|patriarch/))return'c1.story';
    if(has(lesson,/exodus|moses|egypt|liberat/))return'c2.exodus';
    if(has(lesson,/torah|law|holiness|sinai|neighbor|glean/))return'c2.sinai';
    return'c2.exodus';
  }

  if(old===5){
    if(has(lesson,/exile|lament|babylon|return|rebuild/))return has(lesson,/return|rebuild|restor/)?'c2.restoration-hope':'c2.prophets-exile';
    if(has(lesson,/temple|solomon|divided kingdom|monarch|saul|david/))return has(lesson,/temple|solomon|divided kingdom/)?'c2.temple-kingdom':'c2.land-kings';
    return'c2.land-kings';
  }

  if(old===6)return'c5.genre';

  if(old===7){
    if(has(lesson,/hope|restor|new covenant|messian|future/))return'c2.restoration-hope';
    return'c2.prophets-exile';
  }

  if(old===8){
    if(lesson.id==='gospel-comparison'||has(lesson,/four gospels|compare.*gospel|luke.*mark/))return'c4.gospels';
    if(has(lesson,/sermon|beatitude|lord.s prayer|enemy|prayer/))return'c4.teaching';
    if(has(lesson,/scripture|fulfill|messiah|son of man|temple|sabbath|passover/))return'c4.israel-story';
    return'c4.kingdom';
  }

  if(old===9){
    if(has(lesson,/resurrection|crucifix|cross|passion/)&&!has(lesson,/atonement|grace|reconcil|salvation/))return'c4.passion';
    return'c6.sin-salvation';
  }

  if(old===10){
    if(has(lesson,/acts 15|gentile|paul|mission|jerusalem council/))return'c4.paul-gentiles';
    if(has(lesson,/pentecost|spirit|stephen|philip|jerusalem church|early church/))return'c4.pentecost';
    if(has(lesson,/james|letter|epistle|body|belong|community/))return'c4.expansion';
    return'c4.pentecost';
  }

  if(old===11){
    if(has(lesson,/providence|foreknowledge|predestin|freedom|suffering/))return'c6.providence-life';
    return'c6.god-christ';
  }

  if(old===12){
    if(lesson.id==='prayer-practice'||has(lesson,/lord.s prayer|matthew 6/))return'c4.teaching';
    if(lesson.id==='communion-table'||has(lesson,/communion|lord.s supper|eucharist/))return'c4.passion';
    return'c6.church-practice';
  }

  if(old===13)return'c6.traditions';
  if(old===14)return'c6.difficult';
  if(old===15)return'c6.final-hope';

  if(old===16){
    if(has(lesson,/theme|cross-book|argument|allusion|comparison/))return'c5.intertext';
    return'c5.interpretation';
  }

  return mapLegacyUnit(old);
}

export function courseForUnit(unitId){return unitById[unitId]?.courseId||'course.foundations'}
