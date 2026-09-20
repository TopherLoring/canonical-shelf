import {OT_BOOKS} from './library-books-ot.js';
import {NT_BOOKS} from './library-books-nt.js';

export const CATEGORIES={
  law:{name:'Law / Pentateuch',sub:'Torah · Pentateuch',testament:'OT',blurb:'Origins and the covenant: how a family becomes a nation and receives its law.'},
  othist:{name:'Historical Books',sub:'Joshua → Esther',testament:'OT',blurb:'Land, kings, collapse, exile and return — roughly 800 years of national story.'},
  wisdom:{name:'Poetry & Wisdom',sub:'Job → Song of Solomon',testament:'OT',blurb:'Not story at all — songs, sayings, and arguments about suffering, meaning and desire.'},
  major:{name:'Major Prophets',sub:'Isaiah → Daniel',testament:'OT',blurb:'Long books of warning before the exile and comfort during it. Major means long.'},
  minor:{name:'Minor Prophets',sub:'Hosea → Malachi · The Twelve',testament:'OT',blurb:'Twelve short books. Minor means brief — several are under five pages.'},
  gospel:{name:'Gospels & History',sub:'Matthew → Acts',testament:'NT',blurb:'Four accounts of the same life, then the one book on what happened next.'},
  paul:{name:'Pauline Epistles',sub:'Romans → Philemon',testament:'NT',blurb:'Thirteen letters from Paul — arranged by length, not by date.'},
  general:{name:'General Epistles',sub:'Hebrews → Jude',testament:'NT',blurb:'Eight letters from other leaders, mostly to scattered readers rather than one city.'},
  apoc:{name:'Prophecy',sub:'Revelation',testament:'NT',blurb:'One book of visions about judgement, empire, and a world remade.'}
};
export const CATEGORY_ORDER=['law','othist','wisdom','major','minor','gospel','paul','general','apoc'];
export const LIBRARY_BOOKS=[...OT_BOOKS,...NT_BOOKS];
export const BOOK_BY_NUMBER=new Map(LIBRARY_BOOKS.map(book=>[book.n,book]));
export const BOOK_BY_NAME=new Map(LIBRARY_BOOKS.map(book=>[book.name.toLowerCase(),book]));

export const ERAS=[
  {k:'primeval',name:'Primeval',a:null,b:null},
  {k:'patriarch',name:'The Patriarchs',a:-2000,b:-1700},
  {k:'exodus',name:'Exodus & Wilderness',a:-1450,b:-1400},
  {k:'conquest',name:'Conquest & Judges',a:-1400,b:-1050},
  {k:'united',name:'United Monarchy',a:-1050,b:-930},
  {k:'divided',name:'Divided Kingdom',a:-930,b:-586},
  {k:'exile',name:'Exile',a:-605,b:-538},
  {k:'return',name:'Return & Persia',a:-538,b:-400},
  {k:'christ',name:'Life of Christ',a:-4,b:30},
  {k:'church',name:'The Early Church',a:30,b:100}
];

export const TIMELINE_ANCHORS=[
  {y:-2000,t:'Abraham called out of Ur'},
  {y:-1446,t:'The exodus from Egypt'},
  {y:-1010,t:'David becomes king'},
  {y:-966,t:"Solomon's temple begun"},
  {y:-930,t:'The kingdom splits in two'},
  {y:-722,t:'Assyria destroys the northern kingdom'},
  {y:-586,t:'Babylon burns Jerusalem'},
  {y:-538,t:'Cyrus lets the exiles return'},
  {y:-516,t:'The second temple finished'},
  {y:-445,t:'Nehemiah rebuilds the walls'},
  {y:-4,t:'Jesus born'},
  {y:30,t:'Crucifixion and Pentecost'},
  {y:46,t:"Paul's first missionary journey"},
  {y:70,t:'Rome destroys the temple'},
  {y:95,t:'Revelation written on Patmos'}
];

export const THREADS={
  covenant:'Covenant',exile:'Exile & return',kingdom:'Kingdom & king',sacrifice:'Sacrifice & atonement',wilderness:'Wilderness & testing',remnant:'The remnant',temple:'Temple & presence',judgment:'Judgment',mercy:'Mercy & steadfast love',redemption:'Redemption & rescue',wisdom:'Wisdom & the fear of God',faithfulness:'Faithfulness under pressure',worship:'Worship & lament',mission:'Mission outward'
};

export const STORY_ARC=[
  {title:'A world made good, and quickly broken',where:'Genesis 1–11',detail:'Creation, then a rapid sequence of failures — Eden, the first murder, the flood, Babel. These eleven chapters set up the problem the other sixty-five books respond to.'},
  {title:'One family, one promise',where:'Genesis 12–50',detail:'God picks Abraham and promises land, descendants and blessing that spreads outward. The story narrows to four generations of a single messy family.'},
  {title:'Rescue, and a rulebook',where:'Exodus – Deuteronomy',detail:'The family has become a nation of slaves in Egypt. They are freed, brought to Sinai, given law and a covenant, and spend forty years failing to enter the land.'},
  {title:'Land, then chaos',where:'Joshua, Judges',detail:'They take the territory, divide it by tribe, and then spend two centuries without central leadership, cycling through crisis and rescue.'},
  {title:'Kings, and a peak that does not hold',where:'1 Samuel – 1 Kings 11',detail:'The people demand a king. Saul fails, David consolidates and is promised a dynasty, Solomon builds the temple — and then compromises it.'},
  {title:'Two kingdoms, prophets ignored',where:'1 Kings 12 – 2 Kings; most prophets',detail:'The kingdom splits. Prophets spend three centuries warning both halves about injustice and idolatry. Almost nobody listens.'},
  {title:'Exile',where:'2 Kings 25, Lamentations, Ezekiel, Daniel',detail:'Assyria destroys the north in 722 BC. Babylon takes Jerusalem and burns the temple in 586 BC. This is the trauma the Old Testament is written around.'},
  {title:'Return, then a long silence',where:'Ezra, Nehemiah, Haggai – Malachi',detail:'Persia lets a remnant go home. They rebuild a smaller temple and the city walls. Then the record stops for roughly four hundred years.'},
  {title:'Jesus',where:'Matthew, Mark, Luke, John',detail:'Four accounts of one life, death and resurrection, each written for a different audience and selecting different material to make its case.'},
  {title:'The movement, and an ending that is a beginning',where:'Acts, the letters, Revelation',detail:'The message spreads across the Roman empire. Letters address the practical fallout in each city. Revelation closes the collection not with an ending but with a world remade.'}
];

export function searchLibraryBooks(query=''){
  const q=String(query).trim().toLowerCase();
  if(!q)return LIBRARY_BOOKS;
  return LIBRARY_BOOKS.filter(book=>{
    const category=CATEGORIES[book.cat];
    return [book.name,book.hook,book.syn,book.who,book.when,book.read,category?.name,category?.sub,...(book.people||[]),...(book.threads||[])].join(' ').toLowerCase().includes(q);
  });
}
