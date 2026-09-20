const catalog={courses:6,units:44,guidedLessons:116,masteryAndCapstones:119,scoredActivities:235,topics:45};

function replaceExact(root,from,to){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.nodeValue===from)node.nodeValue=to;
  }
}

function applyCurrentCatalog(){
  const root=document.querySelector('#prototype-main');
  if(!root)return;
  replaceExact(root,'25','44');
  replaceExact(root,'139','235');
  replaceExact(root,'25 integrated units','6 courses · 44 scored units');
  replaceExact(root,'Course · Unit 1 of 25','Foundations · current course');
  for(const el of root.querySelectorAll('.metric span')){
    if(el.textContent==='Scored units')el.previousElementSibling && (el.previousElementSibling.textContent=String(catalog.units));
    if(el.textContent==='Scored activities')el.previousElementSibling && (el.previousElementSibling.textContent=String(catalog.scoredActivities));
  }
}

const observer=new MutationObserver(applyCurrentCatalog);
observer.observe(document.querySelector('#prototype-main'),{childList:true,subtree:true});
applyCurrentCatalog();
