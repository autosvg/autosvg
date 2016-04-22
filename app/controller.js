/** 
 * @module app/controller
 */

// import sketchFsm from "../lib/sketchFsm";
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
    var aml = document
    .getElementById("autospec")
    .getElementsByTagName("textarea")[0]
    .value;
    let fsm = pipeline(aml);
    log.warn("Finite state machine");
    if(exception(fsm)) { log.debug(fsm.message); }
    else {
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

