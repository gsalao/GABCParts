export interface IGrades {
  Id: number;
  ModuleNumber: number;
  Title: string;
  QuizScore?: number;
  ExamScore?: number;
}

export interface IGradesAccordionState {
  expandedModules: { [key: number]: boolean };
  gradesOpen: boolean;
}

export interface IGradesTrackerProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}