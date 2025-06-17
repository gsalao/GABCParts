// NOTE: this is assigned by default

import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { IFAQ } from "../../../interfaces";

export interface IFaqProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  listGuid: string;
}