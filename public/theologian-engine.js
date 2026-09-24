import { buildTheologianResponse } from "./theologian.js";
import { requestCloudTheologian, cancelCloudTheologian } from "./theologian-cloud.js";

export function evidenceMarkup(e, esc) {
  const fallback = e.type === "topic" && e.id ? `/topics?topic=${encodeURIComponent(e.id)}` : e.type === "course" && e.id ? `/course?unit=${encodeURIComponent(e.id)}` : null,
    link = e.href || fallback;
  return `<article class="result"><p class="eyebrow">${esc(e.type)} · ${esc(e.evidence || "evidence")}</p><h4>${link ? `<a href="${esc(link)}"${/^https?:/i.test(link) ? " target=\"_blank\" rel=\"noreferrer\"" : ""}>${esc(e.label)}</a>` : esc(e.label)}</h4>${e.detail ? `<p>${esc(e.detail)}</p>` : ""}${e.limits ? `<p><strong>Limit:</strong> ${esc(e.limits)}</p>` : ""}</article>`;
}

export function theologianForm(q, esc) {
  return `<form id="guide-form"><label for="guide-q">Ask the Theologian a study question</label><textarea id="guide-q" name="question" rows="3">${esc(q)}</textarea><button class="button">Ask</button></form>`;
}

export function answerMarkup(answer, esc) {
  return String(answer || "").trim().split(/\n\s*\n/).filter(Boolean).map(block => `<p>${esc(block).replace(/\n/g, "<br>")}</p>`).join("");
}

export function deterministicTheologian(q, { data, policy, statement, theologySources, corpus, route, params }) {
  try {
    return buildTheologianResponse({
      question: q,
      data,
      policy,
      statement,
      sources: theologySources,
      corpus,
      context: { scored: route === "course" && !!params().get("mastery") }
    });
  } catch {
    return {
      intent: "study",
      position: policy.authority.rule,
      method: policy.interpretiveRules || [],
      evidence: [],
      warnings: ["The Theologian withheld a response because its theological validation failed."],
      masteryProtected: false
    };
  }
}

export function deterministicMarkup(q, result, { cloudStatus = "", esc, theologianForm, policy }) {
  return `${theologianForm(q, esc)}${cloudStatus ? `<p class="cloud-theologian-status" role="status" aria-live="polite">${esc(cloudStatus)}</p>` : ""}<div class="evidence"><span class="badge">${esc(result.intent)}</span>${result.masteryProtected ? `<span class="badge">mastery protected</span>` : ""}<span class="badge">bounded by ${esc(policy.authority.normativeCeiling)}</span><p class="lede">${esc(result.position)}</p></div>${result.warnings.length ? `<div class="evidence"><h3>Evidence cautions</h3>${result.warnings.map(x => `<p>${esc(x)}</p>`).join("")}</div>` : ""}${result.evidence.length ? `<section class="evidence"><h3>Evidence and connections</h3>${result.evidence.map(e => evidenceMarkup(e, esc)).join("")}</section>` : ""}<div class="evidence"><h3>How the Theologian is reasoning</h3><ul>${result.method.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="evidence"><span class="badge">local evidence fallback</span></div>`;
}

export function cloudMarkup(q, result, { esc, theologianForm }) {
  const evidence = Array.isArray(result.evidence) ? result.evidence : [],
    guardrails = Array.isArray(result.guardrails) ? result.guardrails : [];
  return `${theologianForm(q, esc)}<section class="evidence cloud-theologian-answer"><div class="badge-row"><span class="badge">Theologian</span><span class="badge">cloud grounded</span>${result.lgbtqResearchApplied ? `<span class="badge">LGBTQ research applied</span>` : ""}</div><div class="cloud-theologian-copy">${answerMarkup(result.answer, esc)}</div></section>${evidence.length ? `<section class="evidence"><h3>Evidence and connections</h3>${evidence.map(e => evidenceMarkup(e, esc)).join("")}</section>` : ""}<details class="evidence"><summary>Guardrails used for this answer</summary><ul>${guardrails.map(item => `<li>${esc(item)}</li>`).join("")}</ul><p class="meta">The current question and user-facing page context are processed by Canonical Shelf\'s Cloudflare Worker for this response. Canonical Shelf does not write the conversation to its database.</p></details><div class="evidence"><span class="badge">cloud synthesis</span><span class="badge">local evidence fallback available</span></div>`;
}

export async function theologianAnswer(question, { data, policy, statement, theologySources, corpus, route, params, esc, theologianBody }) {
  const q = String(question || "").trim() || "What can you help me study?";
  const fallback = deterministicTheologian(q, { data, policy, statement, theologySources, corpus, route, params });
  
  theologianBody.innerHTML = deterministicMarkup(q, fallback, {
    cloudStatus: "Building a grounded response from the BSB, Canonical Shelf content, the Statement of Faith, and vetted theology research…",
    esc,
    theologianForm: (q, esc) => theologianForm(q, esc),
    policy
  });
  
  document.dispatchEvent(new CustomEvent("canonical:canonicalize", { detail: theologianBody }));
  theologianBody.closest("#guide").hidden = false;
  
  try {
    const result = await requestCloudTheologian(q, { path: `${location.pathname}${location.search}` });
    if (theologianBody.querySelector("#guide-q")?.value.trim() !== q) return;
    theologianBody.innerHTML = cloudMarkup(q, result, {
      esc,
      theologianForm: (q, esc) => theologianForm(q, esc)
    });
    document.dispatchEvent(new CustomEvent("canonical:canonicalize", { detail: theologianBody }));
  } catch (error) {
    if (error?.name === "AbortError") return;
    theologianBody.innerHTML = deterministicMarkup(q, fallback, {
      cloudStatus: "Cloud synthesis is unavailable right now. Canonical Shelf is showing the local evidence response instead.",
      esc,
      theologianForm: (q, esc) => theologianForm(q, esc),
      policy
    });
    document.dispatchEvent(new CustomEvent("canonical:canonicalize", { detail: theologianBody }));
  }
}
