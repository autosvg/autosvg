import {exception} from "../lib/utils/check";
import pipeline from "../lib/pipeline";
import draw from "./draw";

const figures = [
  "1-1",
  "1-2",
  "2-1-a",
  "2-1-b",
  "2-1-c",
  "2-2-a",
  "2-2-b",
  "2-2-c",
  "2-4"
];


export default function main() {
  const container = document.getElementsByClassName("container")[0];
  for(let f of figures) {
    const row = document.createElement("div");
    row.id = `figure${f}`;
    row.classList.add("row", "bottom");
    container.appendChild(row);
    const autospec = document.createElement("div");
    autospec.classList.add("autospec", "one-half", "column");
    const textarea = document.createElement("textarea");
    const path = `figures/figure${f}.aml`;
    textarea.readonly = true;
    autospec.appendChild(textarea);
    row.appendChild(autospec);
    const autoimg = document.createElement("div");
    autoimg.classList.add("autoimg", "one-half", "column");
    row.appendChild(autoimg);
    populate(textarea, autoimg, path);
  }
}

function populate(textarea, autoimg, path) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      textarea.value = xhttp.responseText;
      const fsm = pipeline(textarea.value);
      if(exception(fsm)) {
        log.debug(fsm.message);
        return;
      }
      draw(fsm, autoimg);
    }
  };
  xhttp.open("GET", path, true);
  xhttp.send();
}
