export interface GrammarLesson {
  originalPhrase: string;
  correctedPhrase: string;
  explanation: string;
}

export interface AnalysisResult {
  grammarLessons: GrammarLesson[];
  correctedTextOnly: string;
  professionalBusiness: string;
  averageEnglish: string;
  naturalCasual: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  customInstructions?: string;
  result: AnalysisResult;
}
