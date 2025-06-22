import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import UserGreeting from './components/UserGreeting';
import { IUserGreetingProps } from './components/IUserGreetingProps';

export interface IUserGreetingWebPartProps {
  greetingFontColor: string;
  greetingFontFamily: string;
  roleFontColor: string;
  roleFontFamily: string;
  imageBorderColor: string;
  imageBorderWidth: string;
  imageBorderStyle: string;
}

export default class UserGreetingWebPart extends BaseClientSideWebPart<IUserGreetingWebPartProps> {
  public render(): void {
    const user = this.context.pageContext.user;

    const userProfile = {
      displayName: user.displayName,
      role: 'Team Member', // You can replace this with a dynamic source later
      pictureUrl: `https://goldenabccom.sharepoint.com/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(user.email)}`
    };

    const element: React.ReactElement<IUserGreetingProps> = React.createElement(
      UserGreeting,
      {
        userProfile,
        greetingStyle: {
          color: this.properties.greetingFontColor,
          fontFamily: this.properties.greetingFontFamily
        },
        roleStyle: {
          color: this.properties.roleFontColor,
          fontFamily: this.properties.roleFontFamily
        },
        imageStyle: {
          borderColor: this.properties.imageBorderColor,
          borderWidth: this.properties.imageBorderWidth,
          borderStyle: this.properties.imageBorderStyle,
          borderRadius: "50%"
        }
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Customize Greeting Styles" },
          groups: [
            {
              groupName: "Greeting",
              groupFields: [
                PropertyPaneTextField('greetingFontColor', {
                  label: "Greeting Font Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('greetingFontFamily', {
                  label: "Greeting Font Family (e.g. Segoe UI, Arial)"
                })
              ]
            },
            {
              groupName: "Role",
              groupFields: [
                PropertyPaneTextField('roleFontColor', {
                  label: "Role Font Color"
                }),
                PropertyPaneTextField('roleFontFamily', {
                  label: "Role Font Family"
                })
              ]
            },
            {
              groupName: "Image Style",
              groupFields: [
                PropertyPaneTextField('imageBorderColor', {
                  label: "Border Color (e.g. #333 or red)"
                }),
                PropertyPaneTextField('imageBorderWidth', {
                  label: "Border Width (e.g. 2px)"
                }),
                PropertyPaneTextField('imageBorderStyle', {
                  label: "Border Style (e.g. solid, dashed, dotted)"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}