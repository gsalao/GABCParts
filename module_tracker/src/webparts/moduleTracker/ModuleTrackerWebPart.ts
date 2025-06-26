import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IModuleTrackerProps } from "./components/IModuleTrackerProps";
import ModuleTracker from "./components/ModuleTracker";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';


export interface IModuleTrackerWebPartProps {
  headerFont: string;
  headerBackground: string;
  moduleProgressColor: string;
  moduleHeaderFont: string;
  moduleInternalFont: string;
  moduleHeaderBackground: string;
  moduleInternalBackground: string;
}


export default class ModuleTrackerWebPart extends BaseClientSideWebPart<IModuleTrackerWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IModuleTrackerProps> = React.createElement(
      // edit this since dapat React.CSSProperties siya
      ModuleTracker,
      { 
        context: this.context,
        headerFont: this.properties.headerFont,
        headerBackground: this.properties.headerBackground,
        moduleProgressColor: this.properties.moduleProgressColor,
        moduleHeaderFont: this.properties.moduleHeaderFont,
        moduleInternalFont: this.properties.moduleInternalFont,
        moduleHeaderBackground: this.properties.moduleHeaderBackground,
        moduleInternalBackground: this.properties.moduleInternalBackground
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public onDispose(): void {
      ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected async onInit(): Promise<void> {
    this.properties.headerFont = this.properties.headerFont ?? "#FFCC00";
    this.properties.headerBackground = this.properties.headerBackground ?? "#000000";
    this.properties.moduleProgressColor = this.properties.moduleProgressColor ?? "#bf9902";
    this.properties.moduleHeaderFont = this.properties.moduleHeaderFont ?? "#fff";
    this.properties.moduleInternalFont = this.properties.moduleInternalFont ?? "#000";
    this.properties.moduleHeaderBackground = this.properties.moduleHeaderBackground ?? "#000";
    this.properties.moduleInternalBackground = this.properties.moduleInternalBackground ?? "#fff";
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Customize Module Tracker aesthetics" },
          groups: [
            {
              groupName: "Module Header",
              groupFields: [
                PropertyPaneTextField('headerFont', {
                  label: "Global Header Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('headerBackground', {
                  label: "Global Header BG Color (e.g. #333 or red)"
                })
              ]
            },
            {
              groupName: "Module Internals",
              groupFields: [
                PropertyPaneTextField('moduleHeaderFont', {
                  label: "Module Header Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleHeaderBackground', {
                  label: "Module Header BG Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleProgressColor', {
                  label: "Module Progress Bar Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleInternalFont', {
                  label: "Module Internal Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('moduleInternalBackground', {
                  label: "Module Internal BG Color (e.g. #333 or red)"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}