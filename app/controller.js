/** 
 * @module app/controller
 */

// import sketchFsm from "../lib/sketchFsm";
import parser from "./parser";
import pipeline from "../lib/pipeline";
import exception from "../lib/utils/exception";
import draw from "./draw";

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
    log.warn("Descriptor from the parser");
    log.debug(l);
    let fsm = pipeline(l);
    log.warn("Finite state machine");
    if(exception(fsm)) { log.debug(fsm.message); }
    else {
      log.debug(fsm);
      // for(let s of fsm.states.all()) {
      //   log.debug(s);
      // }
      // for(let t of fsm.transitions.all()) {
      //   log.debug(t);
      // }
      //
      let NS = "http://www.w3.org/2000/svg";
      let phantomSvg = document.createElementNS(NS, "svg");
      let phantomText = document.createElementNS(NS, "text");
      phantomSvg.appendChild(phantomText);
      phantomText.textContent = "Napoleon";
      document.body.appendChild(phantomSvg);
      log.error(phantomText.getComputedTextLength());

      log.warn("dagre graph");
      fsm.layout();
      draw(fsm, "#autoimg");
 
    }
  });

}

function cleanup(container) {
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child); 
  }
}

