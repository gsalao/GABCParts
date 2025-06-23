import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { Version } from '@microsoft/sp-core-library';

import StatisticsTracker from './components/StatisticsTracker';
import { IStatisticsTrackerProps } from './components/IStatisticsTrackerProps';

export default class StatisticsTrackerWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element: React.ReactElement<IStatisticsTrackerProps> = React.createElement(
      StatisticsTracker,
      {
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}