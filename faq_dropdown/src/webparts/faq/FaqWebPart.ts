import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneLabel
} from '@microsoft/sp-property-pane';
import Faq from "./components/Faq"; 
import { IFaqProps } from "./components/IFaqProps";

export interface ILMSModulesWebPartProps {
  moduleHeaderFont: string;
  moduleHeaderBackground: string;
  moduleProgressBarUp: string;
  moduleProgressBarDown: string;
  moduleInHeaderFont: string;
  descriptionFont: string;
  lockedFont: string;
  moduleHeaderDivider: string;
  moduleGeneralDivider: string;
  moduleInnerBackground: string;
}

export default class LMSModulesWebPart extends BaseClientSideWebPart<ILMSModulesWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IFaqProps> = React.createElement(
      Faq, {
        context: this.context,
        moduleHeaderFont: this.properties.moduleHeaderFont,
        moduleHeaderBackground: this.properties.moduleHeaderBackground,
        moduleProgressBarUp: this.properties.moduleProgressBarUp,
        moduleProgressBarDown: this.properties.moduleProgressBarDown,
        moduleInHeaderFont: this.properties.moduleInHeaderFont,
        moduleInnerBackground: this.properties.moduleInnerBackground,
        descriptionFont: this.properties.descriptionFont,
        lockedFont: this.properties.lockedFont,
        moduleHeaderDivider: this.properties.moduleHeaderDivider,
        moduleGeneralDivider: this.properties.moduleGeneralDivider
    });

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected async onInit(): Promise<void> {
    this.properties.moduleHeaderFont = this.properties.moduleHeaderFont ?? "#fff",
    this.properties.moduleHeaderBackground = this.properties.moduleHeaderBackground ?? "#000",
    this.properties.moduleProgressBarUp =  this.properties.moduleProgressBarUp ?? "#FFCC00",
    this.properties.moduleProgressBarDown = this.properties.moduleProgressBarDown ?? "#eee",
    this.properties.moduleInHeaderFont = this.properties.moduleInHeaderFont ?? "#000",
    this.properties.moduleInnerBackground = this.properties.moduleInnerBackground ?? "#ffffff",
    this.properties.descriptionFont = this.properties.descriptionFont ?? "#000",
    this.properties.lockedFont = this.properties.lockedFont ?? "#999",
    this.properties.moduleHeaderDivider = this.properties.moduleHeaderDivider ?? "#FFCC00",
    this.properties.moduleGeneralDivider = this.properties.moduleGeneralDivider ?? "#ccc"
  }

  public onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
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
            {
              groupName: "Module Header",
              groupFields: [
                PropertyPaneTextField('moduleHeaderFont', {
                  label: "Global Header Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleHeaderBackground', {
                  label: "Global Header BG Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleProgressBarUp', {
                  label: "Progress Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleProgressBarDown', {
                  label: "Unfilled Progress Color (e.g. #333 or red)"
                })
              ]
            },
            {
              groupName: "Module Internals",
              groupFields: [
                PropertyPaneTextField('moduleInHeaderFont', {
                  label: "Module Header Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleInnerBackground', {
                  label: "Module Inner BG Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('descriptionFont', {
                  label: "Module Description Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('lockedFont', {
                  label: "Locked Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleHeaderDivider', {
                  label: "Module Header Divider Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleGeneralDivider', {
                  label: "Module General Divider Color (e.g. #333 or red)"
                }),
              ]
            }
          ],
        },
      ],
    };
  }
}