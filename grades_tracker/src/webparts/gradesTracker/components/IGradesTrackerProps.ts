import { IGrades } from "../../../interfaces";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IGradesAccordionProps {
  gradesList: IGrades[];
  toggleGrades: () => void;
  toggleModule: (moduleId: number) => void;
  expandedModules: { [key: number]: boolean };
}

export interface IGradesTrackerProps {
  context: WebPartContext;
  headerFont?: string;
  headerBackground?: string;
  moduleProgressColor?: string;
  moduleHeaderFont?: string;
  moduleInternalFont?: string;
  moduleHeaderBackground?: string;
  moduleInternalBackground?: string;
}