/** 
 * @module app/controller
 */

// import sketchFsm from "../lib/sketchFsm";
import pipeline from "../lib/pipeline";
import exception from "../lib/utils/exception";
import draw from "./draw";
import stringifyError from "../lib/error";

/**
 * Controller
 * @return {Object} Not really, just testing
 */
export default function controller() {

  document.getElementById("bGeneration")
  .addEventListener("click", () => {
    let container = document.getElementById("autoimg");
    cleanup(container);
    let error_container = document.getElementById("autospec")
    .getElementsByTagName("textarea")[1];
    error_container.value = "";
    var aml = document
    .getElementById("autospec")
    .getElementsByTagName("textarea")[0]
    .value;
    let fsm = pipeline(aml);
    if(exception(fsm)) { error_container.value = stringifyError(fsm); }
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

