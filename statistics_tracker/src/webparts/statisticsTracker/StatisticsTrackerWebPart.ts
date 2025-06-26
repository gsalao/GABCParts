import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import StatisticsTracker from './components/StatisticsTracker';
import { IStatisticsTrackerProps } from './components/IStatisticsTrackerProps';

export interface IStatisticsTrackerWebPartProps {
  webpartBackground: string;
  headerFont: string;
  secondaryFont: string;
  iconBackground: string;
  circleBackground: string;
  taskFont: string;
  progressDown: string;
  progressUp: string;
}

export default class StatisticsTrackerWebPart extends BaseClientSideWebPart<IStatisticsTrackerWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IStatisticsTrackerProps> = React.createElement(
      StatisticsTracker,
      {
        context: this.context,
        webpartBackground: this.properties.webpartBackground,
        headerFont: this.properties.headerFont,
        secondaryFont: this.properties.secondaryFont,
        iconBackground: this.properties.iconBackground,
        circleBackground: this.properties.circleBackground,
        taskFont: this.properties.taskFont,
        progressDown: this.properties.progressDown,
        progressUp: this.properties.progressUp
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // TODO : add defaults onInit()
  protected async onInit(): Promise<void> {
    this.properties.webpartBackground = this.properties.webpartBackground ?? '#000',
    this.properties.headerFont = this.properties.headerFont ?? '#ffcc00',
    this.properties.secondaryFont = this.properties.secondaryFont ?? '#e6e6e6',
    this.properties.iconBackground = this.properties.iconBackground ?? '#ffcc00',
    this.properties.circleBackground = this.properties.circleBackground ?? '#fff',
    this.properties.taskFont = this.properties.taskFont ?? '#888',
    this.properties.progressDown = this.properties.progressDown ?? "#e6e6e6",
    this.properties.progressUp = this.properties.progressUp ?? '#bf9902'
  }

  public onDispose(): void {
      ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Customize Statistics Tracker aesthetics" },
          groups: [
            {
              groupName: "Background Configurations",
              groupFields: [
                PropertyPaneTextField('webpartBackground', {
                  label: "Main BG Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('circleBackground', {
                  label: "Progress BG Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('iconBackground', {
                  label: "Icon BG Color (e.g. #333 or red)"
                })
              ]
            },
            {
              groupName: "Font Configurations",
              groupFields: [
                PropertyPaneTextField('headerFont', {
                  label: "Header Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('secondaryFont', {
                  label: "Secondary Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('taskFont', {
                  label: "Task Font Color (e.g. #333 or red)"
                }),
              ]
            },
                        {
              groupName: "Progress Chart Configurations",
              groupFields: [
                PropertyPaneTextField('progressUp', {
                  label: "Progress Bar Up Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('progressDown', {
                  label: "Progress Bar Down Color (e.g. #333 or red)"
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}