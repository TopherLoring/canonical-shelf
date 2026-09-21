export const sequence=(title,prompt,items,answer,why,hint='Use the lesson sequence and textual evidence.')=>({kind:'sequence',title,prompt,items,answer,hint,why});
export const match=(title,prompt,items,options,answer,why,hint='Match each item to the distinction established in the lesson.')=>({kind:'match',title,prompt,items,options,answer,hint,why});
export const evidence=(title,prompt,items,answer,why,hint='Choose only claims warranted by the evidence presented.')=>({kind:'evidence',title,prompt,items,answer,hint,why});
export const choice=(title,prompt,options,answer,why,hint='Return to the passage and the lesson’s stated distinction.')=>({kind:'choice',title,prompt,options,answer,hint,why});

export function lesson({id,unitId,title,reading,ref,objective,body,simple,vocab={},deeper='',drawers=[],visual=null,challenges=[],reflect='',model='',sources=[],extraReadings=[],questionThreadIds=[]}){
  if(!id||!unitId||!title||!objective)throw new Error('new curriculum lesson requires id, unitId, title, and objective');
  if(!Array.isArray(body)||body.length<3)throw new Error(`${id}: lesson body must contain at least three substantive steps`);
  if(!Array.isArray(challenges)||challenges.length<2)throw new Error(`${id}: every new guided lesson requires at least two active checks`);
  if(!Array.isArray(questionThreadIds))throw new Error(`${id}: questionThreadIds must be an array`);
  return {id,unitId,title,reading,ref,objective,body,simple,vocab,deeper,drawers,visual,challenges,reflect,model,sources,extraReadings,questionThreadIds,newCurriculum:true};
}

export const drawer=(title,body,tag='Explore')=>({title,body,tag});
