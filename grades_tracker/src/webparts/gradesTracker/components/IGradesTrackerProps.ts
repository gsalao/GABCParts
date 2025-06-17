import { IGrades } from "../../../interfaces";

export interface IGradesAccordionProps {
  gradesList: IGrades[];
  toggleGrades: () => void;
  toggleModule: (moduleId: number) => void;
  expandedModules: { [key: number]: boolean };
}

export interface IGradesTrackerProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}