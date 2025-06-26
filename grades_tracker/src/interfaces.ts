export interface IGrades {
  Id?: number;
  ModuleNumber: number;
  Title: string;
  QuizScore?: number;
  ExamScore?: number;
  QuizMaxScore?: number;
  ExamMaxScore?: number;
  HasExam?: boolean;
}

export interface IGradesAccordionState {
  expandedModules: { [key: number]: boolean };
  gradesOpen: boolean;
}