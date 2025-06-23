export interface IGrades {
  ModuleNumber: number;
  Title: string;
  QuizScore?: number;
  ExamScore?: number;
  QuizMaxScore?: number;
  ExamMaxScore?: number;
  HasExam?: boolean;
}

export interface IModuleProgress {
  ModuleNumber: number;
  Title: string;
  VideoProgress: number;
  QuizProgress: number;
  ExamProgress?: number;
}