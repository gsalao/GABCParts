import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PnPLogging, LogLevel } from "@pnp/logging";

import { spfi, SPFI, SPFx as SPFxSP } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

import { graphfi, GraphFI, SPFx as SPFxGraph } from "@pnp/graph";

let _sp: SPFI | undefined;
let _graph: GraphFI | undefined;

export const getSP = (context?: WebPartContext): SPFI => {
  if (!_sp && context) {
    _sp = spfi().using(SPFxSP(context)).using(PnPLogging(LogLevel.Warning));
  }
  return _sp!;
};

export const getGraph = (context?: WebPartContext): GraphFI => {
  if (!_graph && context) {
    _graph = graphfi().using(SPFxGraph(context));
  }
  return _graph!;
};