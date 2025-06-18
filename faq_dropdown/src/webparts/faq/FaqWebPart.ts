import * as React from "react";
import * as ReactDom from "react-dom";
// import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
// import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IPropertyPaneConfiguration, PropertyPaneLabel } from "@microsoft/sp-property-pane"; // ✅ Correct component for displaying text

import Faq from "./components/Faq"; 
import { IFaqProps } from "./components/IFaqProps";

export interface ILMSModulesWebPartProps {}

export default class LMSModulesWebPart extends BaseClientSideWebPart<ILMSModulesWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  public render(): void {
    const element: React.ReactElement<IFaqProps> = React.createElement(Faq, {
      description: "The \"LMS Modules\" is a web part that displays each module in the LMS Modules list fixed by the SharePoint site administrators.", // ✅ Displays fixed description
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName,
      context: this.context,
      listGuid: "LMS Modules", // Hardcoded list name (assert correct list name)
    });

    ReactDom.render(element, this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "LMS Modules" },
          groups: [
            {
              groupName: "",
              groupFields: [
                PropertyPaneLabel("info", { 
                  text: "The LMS Modules is a web part that displays each module in the LMS Modules list fixed by the SharePoint site administrators.", // ✅ Displays **non-editable** text correctly
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}