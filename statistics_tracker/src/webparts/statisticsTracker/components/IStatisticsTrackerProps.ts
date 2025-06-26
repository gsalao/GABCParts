import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IStatisticsTrackerProps {
  context: WebPartContext;
  webpartBackground: string;
  headerFont: string;
  secondaryFont: string;
  iconBackground: string;
  circleBackground: string;
  taskFont: string;
  progressDown: string;
  progressUp: string;
}