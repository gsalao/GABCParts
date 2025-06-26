import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { IFAQ } from "../../../interfaces";
// ALERT : other defaults
export interface IFaqProps {
  context: WebPartContext;
  moduleHeaderFont: string;
  moduleHeaderBackground: string;
  moduleProgressBarUp: string;
  moduleProgressBarDown: string;
  moduleInHeaderFont: string;
  moduleInnerBackground: string;
  descriptionFont: string;
  lockedFont: string;
  moduleHeaderDivider: string;
  moduleGeneralDivider: string;
}