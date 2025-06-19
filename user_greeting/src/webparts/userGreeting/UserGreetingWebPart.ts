import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import UserGreeting from './components/UserGreeting';
import { IUserGreetingProps } from './components/IUserGreetingProps';

export interface IUserGreetingWebPartProps {}

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
        userProfile 
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
}