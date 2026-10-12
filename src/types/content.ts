import type { GrammarCategory, JlptLevel, PartOfSpeech } from "./jlpt";

export interface VocabWord {
  id: string;
  jlptLevel: JlptLevel;
  word: string;
  reading: string;
  romaji: string;
  meaningEs: string;
  meaningEn?: string;
  partOfSpeech: PartOfSpeech;
  exampleSentenceJp?: string;
  exampleSentenceReading?: string;
  exampleSentenceEs?: string;
  tags?: string[];
}

export interface KanjiExampleWord {
  word: string;
  reading: string;
  meaningEs: string;
}

export interface KanjiEntry {
  id: string;
  character: string;
  jlptLevel: "N5" | "N4";
  strokeCount: number;
  onyomi: string[];
  kunyomi: string[];
  meaningEs: string;
  meaningEn?: string;
  radicals?: string[];
  exampleWords: KanjiExampleWord[];
}

export interface GrammarExample {
  jp: string;
  reading?: string;
  es: string;
}

export interface GrammarRule {
  id: string;
  jlptLevel: JlptLevel;
  category: GrammarCategory;
  title: string;
  pattern: string;
  explanationEs: string;
  structureNotes?: string;
  examples: GrammarExample[];
  relatedGrammarIds?: string[];
}

export interface Lesson {
  id: string;
  jlptLevel: JlptLevel;
  order: number;
  title: string;
  description?: string;
  vocabIds: string[];
  kanjiIds: string[];
  grammarIds: string[];
  exerciseIds: string[];
}
