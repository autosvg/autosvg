/** 
 * @module app/controller
 */

import sketchFsm from "../lib/sketchFsm";
import dagreD3 from "dagre-d3";
import d3 from "d3";
import parser from "./parser";
import pipeline from "../lib/pipeline";
import exception from "../lib/utils/exception";

/**
 * Controller
 * @return {Object} Not really, just testing
 */
export default function controller() {

  document.getElementById("bGeneration")
    .addEventListener("click", () => {
      let container = document.getElementById("autoimg");
      cleanup(container);
      document.getElementById("autospec")
        .getElementsByTagName("textarea")[1]
        .value = "";
      var language = document
        .getElementById("autospec")
        .getElementsByTagName("textarea")[0]
        .value;
        let l = parser.parse(language);
        log.debug(l);
        let p = pipeline(l);
        if(exception(p)) { log.debug(p.message); }
        else { log.debug(p) };
    });
}

function cleanup(container) {
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child); 
  }
}

