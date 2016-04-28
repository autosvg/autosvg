import draw from "./draw";
import pipeline from "../lib/pipeline";
import exception from "../lib/utils/exception";
import stringifyError from "../lib/error";
import d3 from "d3";

export default function render(cal, container) {
  let fsm = pipeline(cal);
  if(exception(fsm)) {
    d3.select(container)[0][0].innerHTML = "<pre>" + stringifyError(fsm) + "</pre>";
  }
  else {
    fsm.layout();
    draw(fsm, container);
  }
}
