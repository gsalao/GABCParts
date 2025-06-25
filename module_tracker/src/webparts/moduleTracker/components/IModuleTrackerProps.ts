import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IModuleTrackerProps {
  context: WebPartContext;
  headerFont?: string;
  headerBackground?: string;
  moduleProgressColor?: string;
  moduleHeaderFont?: string;
  moduleInternalFont?: string;
  moduleHeaderBackground?: string;
  moduleInternalBackground?: string;
}