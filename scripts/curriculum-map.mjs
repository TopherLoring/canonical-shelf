export const units=[
['unit.start','Start Here','Christianity, Jesus, responsible inquiry and learning'],
['unit.read','How to Read a Bible','References, context, translation, manuscripts, authorship, audience and canon'],
['unit.library','The Bible as a Library','Shelf, canon, genres, navigation and chronology versus canonical order'],
['unit.interpretation','How Interpretation Works','Text, context, interpretation, doctrine, application and evidence levels'],
['unit.story','The Story in One View','Whole biblical arc, eras, hinge events and recurring themes'],
['unit.beginnings','Beginnings','Creation, humanity, rupture, mortality and Genesis'],
['unit.abraham-exodus','Abraham to Exodus','Patriarchs, covenant, Egypt, Moses and liberation'],
['unit.torah','Torah and Wilderness','Law, holiness, covenant life, wilderness and Christian use of Old Testament law'],
['unit.land-ruth','Land, Judges, and Ruth','Conquest, violence, Judges, Ruth, covenant loyalty and interpretation'],
['unit.kings','Kings and Temple','Samuel, Saul, David, Solomon, monarchy, temple and power'],
['unit.kingdoms-prophets','Kingdoms and the Prophetic Library','Divided monarchy, prophets, justice, prophetic genres and organization'],
['unit.exile','Exile, Return, and the World Before Jesus','Babylon, Persia, restoration and Second Temple context'],
['unit.wisdom','Poetry and Wisdom','Psalms, Job, Proverbs, Ecclesiastes and Song of Songs'],
['unit.jesus','Jesus and the Gospels','Jewish context, four Gospels, kingdom, parables, welcome and discipleship'],
['unit.cross','Cross, Resurrection, and Salvation','Cross, resurrection, grace, repentance, reconciliation and atonement models'],
['unit.acts','Acts and the Early Church','Spirit, mission, Gentile inclusion, conflict, discernment and belonging'],
['unit.letters','Paul and the Other Letters','Paul, Hebrews, James, Peter, John, Jude, communities, ethics and interpretation'],
['unit.doctrine-develops','How Christian Doctrine Develops','Scripture, interpretation, councils, creeds and doctrinal reasoning'],
['unit.doctrine','God and Christian Doctrine','Trinity, incarnation, Spirit, providence, freedom and grace'],
['unit.practice','Christian Practice','Baptism, Communion, prayer, ethics, formation and neighbor-love'],
['unit.traditions','Christian Traditions','Catholic, Orthodox, Protestant and denominational differences'],
['unit.difficult','Difficult Questions and Contested Interpretations','Suffering, violence, LGBTQ interpretation, religions, miracles, evil and uncertainty'],
['unit.hope','Resurrection, Judgment, and New Creation','Apocalypse, Revelation, judgment, final destiny and renewed creation'],
['unit.themes','Themes Across Scripture','Cross-canon synthesis without flattening local context'],
['unit.mastery','Independent Mastery','Whole-book contextual interpretation and synthesis']
].map(([id,title,scope],i)=>({id,sequence:i+1,title,scope}));

const base={1:'unit.start',2:'unit.read',3:'unit.library',4:'unit.story',5:'unit.beginnings',6:'unit.abraham-exodus',7:'unit.torah',8:'unit.land-ruth',9:'unit.kings',10:'unit.kingdoms-prophets',11:'unit.exile',12:'unit.wisdom',13:'unit.kingdoms-prophets',14:'unit.jesus',15:'unit.cross',16:'unit.acts',17:'unit.letters',18:'unit.letters',19:'unit.doctrine',20:'unit.practice',21:'unit.traditions',22:'unit.difficult',23:'unit.hope',24:'unit.themes',25:'unit.mastery'};
export function mapLegacyUnit(n){return base[Number(n)]||'unit.start'}
export function mapLesson(l){
 const text=`${l.id||''} ${l.title||''} ${l.objective||''}`.toLowerCase();
 const u=Number(l.v4Unit||l.unit)||1;
 if(u===2&&/(context|interpret|application|evidence|observation)/.test(text))return 'unit.interpretation';
 if((u===19||u===21)&&/(creed|council|doctrine develop|historic formulation|authority.*tradition)/.test(text))return 'unit.doctrine-develops';
 return mapLegacyUnit(u);
}
