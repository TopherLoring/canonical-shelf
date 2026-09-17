/* Canonical Shelf curriculum expansion: additive layer over the 23 baseline lessons. */
(() => {
  'use strict';
  const D = window.FOUNDATIONS_DATA;
  if (!D || !Array.isArray(D.lessons) || !Array.isArray(D.units)) throw new Error('Foundations data must load before the expansion.');
  if (window.CANON_EXPAND) return;

  const evidence = (title, reading, items, why) => ({
    kind:'evidence', title:`Investigate: ${title}`,
    prompt:`Build an evidence board from ${reading}. Select the two supported statements; leave the two overreaches off the board.`,
    items, answer:[0,1],
    hint:'Locate what the passage actually gives you and distinguish it from a stronger claim that would require more evidence.',
    why
  });
  const scenario = (title, stages, deeper, application) => ({
    kind:'scenario', title:`Put ${title.toLowerCase()} to work`,
    prompt:'Navigate two decisions. Choose the response that best fits the passage and the limits of the evidence.',
    items:[], answer:[], stages:stages.map(([prompt,good,bad,reason],i)=>{
      const choices=(i%2 ? [good,bad] : [bad,good]);
      return {prompt,choices,correct:choices.indexOf(good),feedback:choices.map(x=>x===good?reason:`Reconsider: ${reason}`)};
    }),
    hint:deeper, why:application
  });
  const argument = (title, evidenceItems, claim, application) => ({
    kind:'argument', title:`Return investigation: ${title}`,
    prompt:'Build three supported links: two observations support one interpretation, and that interpretation supports a proportionate application. Leave the competing claim disconnected.',
    items:[`Observation: ${evidenceItems[0]}`,`Observation: ${evidenceItems[1]}`,`Interpretation: ${claim}`,`Application: ${application}`,`Competing claim: ${evidenceItems[2]}`],
    answer:[[0,2],[1,2],[2,3]],
    hint:'Explain why each observation supports the interpretation, then why the interpretation warrants this application without proving every larger claim.',
    why:`${claim} ${application}`
  });
  const match = (title,vocab,simple) => {
    const entries=Object.entries(vocab);
    return {kind:'match',title:`Restore the toolkit: ${title}`,prompt:'Reconnect the three terms with their meanings.',items:entries.map(x=>x[0]),options:entries.map(x=>x[1]).reverse(),answer:[2,1,0],hint:simple,why:'These distinctions make the reading more precise without requiring personal assent.'};
  };
  const sequence = (title,prompt,items,why) => ({kind:'sequence',title:`Reconstruct: ${title}`,prompt,items,answer:items.map((_,i)=>i),hint:why,why});

  function add(spec) {
    if (D.lessons.some(l=>l.id===spec.id)) return;
    const vocab=Object.fromEntries(spec.vocab);
    const first=spec.sequence ? sequence(spec.title,...spec.sequence) : evidence(spec.title,spec.reading,spec.evidence,spec.claim);
    D.lessons.push({
      id:spec.id, unit:spec.unit, title:spec.title, objective:spec.objective,
      reading:spec.reading, ref:spec.ref, body:spec.body, simple:spec.simple,
      vocab, deeper:spec.deeper, reflect:spec.reflect, model:spec.model,
      extraReadings:spec.extraReadings||undefined, sources:spec.sources||undefined,
      challenges:[first,scenario(spec.title,spec.decisions,spec.deeper,spec.application)],
      reviewChallenges:[argument(spec.title,spec.evidence,spec.claim,spec.application),match(spec.title,vocab,spec.simple)]
    });
  }
  window.CANON_EXPAND={D,add};
})();
