const faithHost=document.querySelector('#statement-content');
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const inline=value=>esc(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');

function markdownToHtml(markdown=''){
  const lines=String(markdown).replace(/\r/g,'').split('\n');
  const html=[];let listOpen=false,paragraph=[];
  const flushParagraph=()=>{if(paragraph.length){html.push(`<p>${inline(paragraph.join(' '))}</p>`);paragraph=[]}};
  const closeList=()=>{if(listOpen){html.push('</ul>');listOpen=false}};
  for(const raw of lines){
    const line=raw.trim();
    if(!line){flushParagraph();closeList();continue}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){flushParagraph();closeList();const level=Math.min(3,heading[1].length+1);html.push(`<h${level}>${inline(heading[2])}</h${level}>`);continue}
    if(/^[-*]\s+/.test(line)){flushParagraph();if(!listOpen){html.push('<ul>');listOpen=true}html.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`);continue}
    paragraph.push(line);
  }
  flushParagraph();closeList();return html.join('');
}

async function loadStatement(){
  if(!faithHost)return;
  try{
    const response=await fetch('/data/statement-of-faith.md');
    if(!response.ok)throw new Error('statement unavailable');
    const markdown=await response.text();
    faithHost.innerHTML=markdownToHtml(markdown)||'<p class="notice">The Statement of Faith is currently unavailable.</p>';
  }catch{
    faithHost.innerHTML='<p class="notice">The Statement of Faith could not be loaded. Reload this page when the local content bundle is available.</p>';
  }
}

loadStatement().finally(()=>{
  const target=location.hash&&document.querySelector(location.hash);
  if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
});
