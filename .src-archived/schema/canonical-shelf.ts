export type Testament = 'OT' | 'NT';
export type CanonicalCategory = 'law' | 'othist' | 'wisdom' | 'major' | 'minor' | 'gospel' | 'nthist' | 'paul' | 'general' | 'apoc';

export interface PassageAddress {
  book: number;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface CanonicalBook {
  bookNumber: number;
  name: string;
  testament: Testament;
  category: CanonicalCategory;
  categoryOrder: number;
  chaptersCount: number;
  hook: string;
  synopsis: string;
  traditionalAuthor: string;
  criticalAuthorDate: string;
  eraId: string;
  narrativeTimeRange: { startYear?: number; endYear?: number; displayRange: string };
  keyPeople: string[];
  openingMove: string;
  canonicalThreads: string[];
  dateDisputed: boolean;
}

export interface LessonStepCard {
  id: string;
  stepNumber: number;
  title: string;
  body: string[];
  verseRef?: string;
  verseText?: string;
  whatDoesThisMean: string;
}

export interface CurriculumLesson {
  id: string;
  unitId: string;
  movementId: string;
  sequenceInUnit: number;
  title: string;
  objective: string;
  plainSummary: string;
  readingAddress: PassageAddress;
  readingReferenceText: string;
  stepCards: LessonStepCard[];
  apparatus: {
    glossaryItemIds: string[];
    translationVariantIds: string[];
    disagreementIds: string[];
    historicalEvidenceIds: string[];
  };
  checks: unknown[];
  reviewChecks: unknown[];
  reflection: { prompt: string; modelResponse: string };
}
