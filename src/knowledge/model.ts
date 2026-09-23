export type DoctrinalStatus = "affirmed" | "bounded-inference" | "open" | "descriptive-only" | "outside-scope";
export type EvidenceStatus = "direct" | "strong" | "plausible" | "contested" | "speculative";
export type ClaimDomain = "biblical-text" | "history" | "language" | "doctrine" | "interpretation" | "ethics" | "reception-history" | "application";
export type InterpretationType = "historical-critical" | "traditional" | "theological" | "canonical" | "feminist" | "queer" | "liberation" | "literary" | "reception-history";

export interface Claim {
  id: string;
  proposition: string;
  domain: ClaimDomain;
  doctrinalStatus: DoctrinalStatus;
  evidenceStatus: EvidenceStatus;
  authorityRefs: string[];
  sourceRefs: string[];
  scriptureRefs: string[];
  supports?: string[];
  challenges?: string[];
  qualifies?: string[];
  traditions?: string[];
}

export interface Interpretation {
  id: string;
  label: string;
  passageRefs: string[];
  conceptRefs: string[];
  type: InterpretationType;
  proposition: string;
  evidenceStatus: EvidenceStatus;
  doctrinalStatus: DoctrinalStatus;
  sourceRefs: string[];
  heldBy?: string[];
}

export interface StatementArticle {
  id: string;
  number: number;
  title: string;
  text: string;
  affirmedClaims: string[];
  boundedInferences: string[];
  openQuestions: string[];
  interpretiveRules: string[];
}

export interface LearnerContextSummary {
  route?: string;
  activity?: string;
  masteryActive: boolean;
  completed?: number;
  total?: number;
  reviewsDue?: number;
  recent?: string[];
}

export interface TheologyPolicyContext {
  question: string;
  doctrinalStatus: DoctrinalStatus;
  canonicalPosition?: string;
  statementArticleRefs: string[];
  requiredClaimRefs: string[];
  prohibitedOverstatements: string[];
  scriptureRefs: string[];
  interpretationRefs: string[];
  sourceRefs: string[];
  learnerContext?: LearnerContextSummary;
}
