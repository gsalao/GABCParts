import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as ReactDom from "react-dom";
import GradesTracker from "./components/GradesTracker";

export default class GradesWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(GradesTracker, { context: this.context });
    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}