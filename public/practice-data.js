export const PRACTICE_RANKS=[
  {xp:0,name:'Visitor'},
  {xp:400,name:'Reader'},
  {xp:1100,name:'Copyist'},
  {xp:2300,name:'Scribe'},
  {xp:4000,name:'Annotator'},
  {xp:6400,name:'Illuminator'},
  {xp:9500,name:'Archivist'}
];

export const PRACTICE_ACHIEVEMENTS=[
  {id:'first',name:'First Folio',description:'Finish your first level.'},
  {id:'pent',name:'Perfect Pentateuch',description:'Four stars on The Law.'},
  {id:'twelve',name:'The Twelve',description:'Four stars on the Minor Prophets.'},
  {id:'thirteen',name:'Longest to Shortest',description:"Four stars on Paul's Thirteen."},
  {id:'flawless',name:'Flawless',description:'Clear a level without a single mistake.'},
  {id:'streak10',name:'Ten in a Row',description:'Answer ten straight correctly.'},
  {id:'clockwork',name:'Clockwork',description:'Four stars on any timed Rush level.'},
  {id:'standing',name:'Last One Standing',description:'Reach 30 in Survival.'},
  {id:'nohint',name:'Unaided',description:'Four stars on a Capstone without a hint.'},
  {id:'shelf',name:'The Whole Shelf',description:'Clear the Order Capstone.'},
  {id:'sorter',name:'Sorter',description:'Clear the Groups Capstone.'},
  {id:'closered',name:'Close Reader',description:'Clear the Substance Capstone.'},
  {id:'illum',name:'Illuminator',description:'Clear the Verses Capstone.'},
  {id:'gilt',name:'Full Gilt',description:'Four stars on all 40 levels.'}
];

export const PRACTICE_STAGES=[
  {id:'order',tag:'Stage 1',name:'The Order',description:'Longer drills on canonical order. Course teaches the structure; Practice turns it into quick retrieval.',levels:[
    {id:'o1',name:'The Law',sub:'Books 1–5',game:'sequence',engines:['sequence'],count:8,size:5,scope:{cat:'law'},mode:'run'},
    {id:'o2',name:'Conquest & Kings',sub:'Books 6–12',game:'sequence',engines:['sequence','gap'],count:8,size:5,scope:{from:6,to:12},mode:'run'},
    {id:'o3',name:'Chronicles to Esther',sub:'Books 13–17',game:'sequence',engines:['sequence','gap'],count:8,size:5,scope:{from:13,to:17},mode:'run'},
    {id:'o4',name:'Shelf Slots: the Histories',sub:'Drop books into numbered positions',game:'shelf',format:'shelf',slots:8,scope:{from:6,to:17}},
    {id:'o5',name:'Songs & Sayings',sub:'Books 18–22',game:'sequence',engines:['sequence','next'],count:8,size:5,scope:{cat:'wisdom'},mode:'run'},
    {id:'o6',name:'Before or After: Law & Poetry',sub:'Fast binary calls',game:'before-after',engines:['before-after'],count:12,scope:{from:1,to:22}},
    {id:'o7',name:'The Major Prophets',sub:'Books 23–27',game:'sequence',engines:['sequence','next'],count:8,size:5,scope:{cat:'major'},mode:'run'},
    {id:'o8',name:'The Twelve',sub:'Books 28–39',game:'sequence',engines:['sequence','gap'],count:9,size:6,scope:{cat:'minor'},mode:'run'},
    {id:'o9',name:'Pairs: the Prophets',sub:'Match each book to what it contains',game:'pairs',format:'pairs',pairs:6,scope:{from:23,to:39}},
    {id:'o10',name:'Spot the Misfit: OT',sub:'One book is in the wrong run',game:'misfit',engines:['misfit'],count:8,scope:{from:1,to:39}},
    {id:'o11',name:'Before or After: OT',sub:'All 39, fast',game:'before-after',engines:['before-after'],count:12,scope:{from:1,to:39}},
    {id:'o12',name:'Old Testament Rush',sub:'60 seconds, as many as you can',game:'clock',format:'clock',seconds:60,engines:['next','previous','gap','before-after'],scope:{from:1,to:39}},
    {id:'o13',name:'Old Testament Gauntlet',sub:'All 39, mixed drills',game:'mix',engines:['next','previous','gap','sequence'],count:12,size:5,scope:{from:1,to:39},mode:'scatter'},
    {id:'o14',name:'Gospels & Acts',sub:'Books 40–44',game:'sequence',engines:['sequence','next'],count:8,size:5,scope:{from:40,to:44},mode:'run'},
    {id:'o15',name:"Paul's Thirteen",sub:'Books 45–57, longest to shortest',game:'sequence',engines:['sequence','gap'],count:9,size:6,scope:{cat:'paul'},mode:'run'},
    {id:'o16',name:'Letters & the End',sub:'Books 58–66',game:'sequence',engines:['sequence','gap'],count:8,size:5,scope:{from:58,to:66},mode:'run'},
    {id:'o17',name:'Shelf Slots: the New Testament',sub:'Drop books into numbered positions',game:'shelf',format:'shelf',slots:8,scope:{from:40,to:57}},
    {id:'o18',name:'Before or After: NT',sub:'All 27, fast',game:'before-after',engines:['before-after'],count:12,scope:{from:40,to:66}},
    {id:'o19',name:'New Testament Rush',sub:'60 seconds, as many as you can',game:'clock',format:'clock',seconds:60,engines:['next','previous','gap','before-after'],scope:{from:40,to:66}},
    {id:'o20',name:'The Whole Shelf',sub:'Capstone · all 66, three lives, 40 to max it',game:'survival',format:'survival',lives:3,engines:['next','previous','gap','before-after','misfit'],scope:{all:true},boss:true}
  ]},
  {id:'groups',tag:'Stage 2',name:'The Groups',description:'Nine canonical groups give every book a neighborhood and make retrieval easier.',levels:[
    {id:'g1',name:'Old Testament groups',sub:'Five groups, 39 books',game:'quiz',engines:['category'],count:10,scope:{from:1,to:39}},
    {id:'g2',name:'New Testament groups',sub:'Four groups, 27 books',game:'quiz',engines:['category'],count:10,scope:{from:40,to:66}},
    {id:'g3',name:'Sort the Shelf: OT',sub:'Sort each book into its group',game:'bins',format:'bins',count:10,scope:{from:1,to:39}},
    {id:'g4',name:'Sort the Shelf: NT',sub:'Sort each book into its group',game:'bins',format:'bins',count:10,scope:{from:40,to:66}},
    {id:'g5',name:'Odd one out',sub:'Spot the book that does not fit',game:'quiz',engines:['odd'],count:10,scope:{all:true}},
    {id:'g6',name:'Where groups begin',sub:'First and last book of each group',game:'quiz',engines:['bounds'],count:10,scope:{all:true}},
    {id:'g7',name:'The Groups',sub:'Capstone · mixed, all 66',game:'mix',engines:['category','odd','bounds'],count:14,scope:{all:true},boss:true}
  ]},
  {id:'substance',tag:'Stage 3',name:'The Substance',description:'What is actually inside each book: its one-line hook, important people, and plot movement.',levels:[
    {id:'s1',name:'One-liners: Old Testament',sub:'Match the summary to the book',game:'quiz',engines:['hook'],count:10,scope:{from:1,to:39}},
    {id:'s2',name:'One-liners: New Testament',sub:'Match the summary to the book',game:'quiz',engines:['hook'],count:10,scope:{from:40,to:66}},
    {id:'s3',name:"Who's in it",sub:'Match the cast to the book',game:'quiz',engines:['people'],count:10,scope:{all:true}},
    {id:'s4',name:'The plot',sub:'Match the synopsis to the book',game:'quiz',engines:['synopsis'],count:10,scope:{all:true}},
    {id:'s5',name:'Substance Rush',sub:'60 seconds, as many as you can',game:'clock',format:'clock',seconds:60,engines:['hook','people','synopsis'],scope:{all:true}},
    {id:'s6',name:'All Sixty-Six',sub:'Capstone · mixed, all 66',game:'mix',engines:['hook','people','synopsis'],count:14,scope:{all:true},boss:true}
  ]},
  {id:'verses',tag:'Stage 4',name:'The Verses',description:'Ninety-seven standout passages tied back to their books, themes, speakers, recipients, and contexts.',levels:[
    {id:'v1',name:'Prophecy',sub:'',game:'quiz',engines:['verse-book','verse-theme'],count:10,verseScope:['prophecy']},
    {id:'v2',name:'Love',sub:'',game:'quiz',engines:['verse-book','verse-theme'],count:10,verseScope:['love']},
    {id:'v3',name:'Strength',sub:'',game:'quiz',engines:['verse-book','verse-theme'],count:10,verseScope:['strength']},
    {id:'v4',name:'Fruit I',sub:'Joy · peace · patience',game:'quiz',engines:['verse-book','verse-theme'],count:10,verseScope:['joy','peace','longsuffering']},
    {id:'v5',name:'Fruit II',sub:'Kindness · goodness · faithfulness',game:'quiz',engines:['verse-book','verse-theme'],count:10,verseScope:['gentleness','goodness','faith']},
    {id:'v6',name:'Fruit III',sub:'Gentleness · self-control',game:'quiz',engines:['verse-book','verse-theme','verse-fill'],count:10,verseScope:['meekness','temperance']},
    {id:'v7',name:'Every Theme',sub:'Capstone · all themes',game:'mix',engines:['verse-book','verse-theme','verse-fill'],count:14,verseScope:'all',boss:true}
  ]}
];

export const PRACTICE_LEVELS=PRACTICE_STAGES.flatMap(stage=>stage.levels.map(level=>({...level,stageId:stage.id,stageName:stage.name,stageTag:stage.tag})));
export const PRACTICE_GAME_FAMILIES=[
  ['sequence','Sequence'],['gap','Fill the Gap'],['before-after','Before or After'],['misfit','Spot the Misfit'],['shelf','Shelf Slots'],['pairs','Pairs'],['pairs-number','Pairs by Number'],['bins','Sort the Shelf'],['clock','Beat the Clock'],['survival','Survival'],['category','Group Drill'],['hook','Content Drill'],['jumble','Word Jumble'],['jumble-hard','Word Jumble · Hard'],['guess-book','Guess the Book'],['odd','Spot the Impostor'],['verse-drill','Verse Drill']
];

export const PRACTICE_SCOPES=[
  {id:'all',name:'Whole canon',scope:{all:true}},
  {id:'ot',name:'Old Testament',scope:{from:1,to:39}},
  {id:'nt',name:'New Testament',scope:{from:40,to:66}},
  {id:'law',name:'Law / Pentateuch',scope:{cat:'law'}},
  {id:'history',name:'Historical Books',scope:{cat:'othist'}},
  {id:'wisdom',name:'Poetry & Wisdom',scope:{cat:'wisdom'}},
  {id:'major',name:'Major Prophets',scope:{cat:'major'}},
  {id:'minor',name:'Minor Prophets',scope:{cat:'minor'}},
  {id:'gospels',name:'Gospels & Acts',scope:{cat:'gospel'}},
  {id:'paul',name:'Pauline Letters',scope:{cat:'paul'}},
  {id:'general',name:'General Letters',scope:{cat:'general'}}
];

export function practiceRank(xp=0){let rank=PRACTICE_RANKS[0];for(const candidate of PRACTICE_RANKS)if(xp>=candidate.xp)rank=candidate;return rank}
export function nextPracticeRank(xp=0){return PRACTICE_RANKS.find(rank=>rank.xp>xp)||null}
