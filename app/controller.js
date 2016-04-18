/** 
 * @module app/controller
 */

import draw from "./draw";
import { deserialize } from "../lib/json";
import dagreD3 from "dagre-d3";
import d3 from "d3";

/**
 * Controller
 * @return {Object} Not really, just testing
 */
export default function controller() {
  document
    .getElementById("bGeneration")
    .addEventListener("click", () => {
      let container = document.getElementById("autoimg"); 
      cleanup(container);
      let fsm = deserialize(document
        .getElementById("autospec")
        .getElementsByTagName("textarea")[0]
        .value);
      let svg = d3.select("#autoimg").append("svg");
      let render = new dagreD3.render();
      log.warn(fsm.graph);
      render(svg, fsm.graph);
    });
}

function cleanup(container) {
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child); 
  }
}

