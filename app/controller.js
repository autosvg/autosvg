/** 
 * @module app/controller
 */

import sketchFsm from "../lib/sketchFsm";
import dagreD3 from "dagre-d3";
import d3 from "d3";
import Parser from "./parser";
import pipeline from "../lib/pipeline";
import exception from "../lib/utils/exception";

/**
 * Controller
 * @return {Object} Not really, just testing
 */
export default function controller() {

  var parser = new Parser();

  document.addEventListener("DOMContentLoaded", function() {
    parser.loadGrammar("grammar.pegjs");
  });

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
      // try {
        let l = parser.buildParser().parse(language);
        log.debug(l);
        let p = pipeline(l);
        if(exception(p)) { log.debug(p.message); }
        else { log.debug(p) };
      /*} catch (err) {
        document
          .getElementById("autospec")
          .getElementsByTagName("textarea")[1]
          .value = err;
          }*/

      //let fsm = sketchFsm(parser.buildParser().parse(language));
      // let svg = d3.select("#autoimg").append("svg");
      // let render = new dagreD3.render();
      // log.warn(fsm.graph);
      // render(svg, fsm.graph);
    });
}

function cleanup(container) {
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child); 
  }
}

