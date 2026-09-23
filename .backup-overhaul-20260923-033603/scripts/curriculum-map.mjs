import {courses,units,unitById,courseById} from '../content/curriculum/structure.mjs';

export {courses,units,unitById,courseById};

// v4/v7 semantic units are preserved here only as migration inputs. Existing mastery IDs
// remain stable while their placement moves into the approved six-course hierarchy.
const legacyUnitMap={
  1:'c1.christianity',        // Start Here
  2:'c1.reading',             // How to Read a Bible
  3:'c1.bible',               // Bible as a Library
  4:'c1.story',               // Story in One View
  5:'c1.story',               // Beginnings
  6:'c2.exodus',              // Abraham to Exodus
  7:'c2.sinai',               // Torah and Wilderness
  8:'c2.land-kings',          // Land and Judges
  9:'c2.temple-kingdom',      // Kings and Temple
  10:'c2.prophets-exile',     // Division and Prophets
  11:'c2.restoration-hope',   // Exile and Return
  12:'c5.genre',              // Poetry and Wisdom
  13:'c2.prophets-exile',     // Prophetic Library
  14:'c4.gospels',            // Jesus and the Gospels
  15:'c6.sin-salvation',      // Cross and Salvation
  16:'c4.pentecost',          // Acts and Early Church
  17:'c4.expansion',          // Paul and Letters
  18:'c4.expansion',          // General Letters
  19:'c6.god-christ',         // Christian Doctrine
  20:'c6.church-practice',    // Christian Practice
  21:'c6.traditions',         // Christian Traditions
  22:'c6.difficult',          // Difficult Questions
  23:'c6.final-hope',         // Resurrection/Judgment/New Creation
  24:'c5.intertext',          // Themes Across Scripture
  25:'c5.interpretation'      // Independent Mastery
};

export function mapLegacyUnit(n){return legacyUnitMap[Number(n)]||'c1.christianity'}

const text=lesson=>`${lesson.id||''} ${lesson.title||''} ${lesson.objective||''} ${(lesson.body||[]).join(' ')}`.toLowerCase();
const has=(lesson,re)=>re.test(text(lesson));

/** Map the 70 inherited guided lessons by their semantic v4/v7 unit. */
export function mapLesson(lesson){
  const old=Number(lesson.v4Unit||lesson.unit)||1;

  if(old===1){
    if(lesson.id==='library')return'c1.bible';
    if(lesson.id==='story')return'c1.story';
    if(lesson.id==='context')return'c1.reading';
    return'c1.christianity';
  }

  if(old===2){
    if(lesson.id==='translation'||has(lesson,/translation difference|manuscript witness|textual variant|textual apparatus/))return'c1.transmission';
    return'c1.reading';
  }

  if(old===3)return'c1.bible';
  if(old===4)return'c1.story';
  if(old===5)return'c1.story';

  if(old===6){
    if(has(lesson,/abraham|promise|patriarch/)&&!has(lesson,/exodus|moses|egypt/))return'c1.story';
    return'c2.exodus';
  }

  if(old===7){
    if(has(lesson,/tabernacle|ark|priest|sacrif|atonement|clean|unclean|festival|sabbath/))return'c2.sacrifice';
    return'c2.sinai';
  }

  if(old===8)return'c2.land-kings';

  if(old===9){
    if(has(lesson,/temple|solomon|jerusalem|divided kingdom/))return'c2.temple-kingdom';
    return'c2.land-kings';
  }

  if(old===10){
    if(has(lesson,/hope|restor|future|messian/))return'c2.restoration-hope';
    return'c2.prophets-exile';
  }

  if(old===11){
    if(has(lesson,/return|rebuild|restor|persia|hope/))return'c2.restoration-hope';
    return'c2.prophets-exile';
  }

  if(old===12)return'c5.genre';

  if(old===13){
    if(has(lesson,/hope|restor|new covenant|messian|future/))return'c2.restoration-hope';
    return'c2.prophets-exile';
  }

  if(old===14){
    if(lesson.id==='gospel-comparison'||has(lesson,/four gospels|compare.*gospel|luke.*mark/))return'c4.gospels';
    if(has(lesson,/sermon|beatitude|lord.s prayer|enemy|prayer/))return'c4.teaching';
    if(has(lesson,/scripture|fulfill|messiah|son of man|temple|sabbath|passover/))return'c4.israel-story';
    return'c4.kingdom';
  }

  if(old===15){
    if(has(lesson,/resurrection|crucifix|passion/)&&!has(lesson,/atonement|grace|reconcil|salvation/))return'c4.passion';
    return'c6.sin-salvation';
  }

  if(old===16){
    if(has(lesson,/acts 15|gentile|paul|mission|jerusalem council/))return'c4.paul-gentiles';
    if(has(lesson,/letter|epistle|body|belong|community/)&&!has(lesson,/pentecost|stephen|philip/))return'c4.expansion';
    return'c4.pentecost';
  }

  if(old===17)return'c4.expansion';
  if(old===18)return'c4.expansion';

  if(old===19){
    if(has(lesson,/providence|foreknowledge|predestin|freedom|suffering/))return'c6.providence-life';
    return'c6.god-christ';
  }

  if(old===20){
    if(lesson.id==='prayer-practice'||has(lesson,/lord.s prayer|matthew 6/))return'c4.teaching';
    if(lesson.id==='communion-table'||has(lesson,/communion|lord.s supper|eucharist/))return'c4.passion';
    return'c6.church-practice';
  }

  if(old===21)return'c6.traditions';
  if(old===22)return'c6.difficult';
  if(old===23)return'c6.final-hope';
  if(old===24)return'c5.intertext';
  if(old===25)return'c5.interpretation';
  return mapLegacyUnit(old);
}

export function courseForUnit(unitId){return unitById[unitId]?.courseId||'course.foundations'}
