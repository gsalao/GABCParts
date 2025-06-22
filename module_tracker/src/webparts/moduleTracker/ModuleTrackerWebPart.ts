import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IModuleTrackerProps } from "./components/IModuleTrackerProps";
import ModuleTracker from "./components/ModuleTracker";

export default class ModuleTrackerWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element: React.ReactElement<IModuleTrackerProps> = React.createElement(
      ModuleTracker,
      { context: this.context }
    );

    ReactDom.render(element, this.domElement);
  }
}