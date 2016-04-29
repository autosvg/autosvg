import {exception} from "../lib/utils/check";
import pipeline from "../lib/pipeline";
import {default as stringifyError, firstError} from "../lib/error";
import draw from "./draw";

const demos = [
  "basic",
  "inference",
  "labels",
  "placement",
  "ALDToken",
  "existingId",
  "wrongType",
  "syntax",
  "MBToken"
];

const titles = [
  "Exemple simple",
  "Inférence",
  "Modification du label",
  "Positionement manuel",
  "Erreur 1",
  "Erreur 2",
  "Erreur 3",
  "Erreur 4",
  "Erreur 5"
];

export default function main() {
  const container = document.getElementsByClassName("container")[0];
  for(let i = 0; i < demos.length; i++) {
    const d = demos[i];
    const row = document.createElement("div");
    row.id = `demo-${d}`;
    row.classList.add("row", "bottom");
    container.appendChild(row);
    const autospec = document.createElement("div");
    autospec.classList.add("autospec", "one-half", "column");
    const textarea = document.createElement("textarea");
    const path = `demo/${d}.aml`;
    autospec.appendChild(textarea);
    const title = document.createElement("h3");
    title.innerHTML = titles[i];
    row.appendChild(title);
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
        const err = stringifyError(firstError(fsm))
        const errorTA = document.createElement("textarea");
        errorTA.value = stringifyError(firstError(fsm));
        autoimg.appendChild(errorTA);
        return;
      }
      draw(fsm, autoimg);
    }
  };
  xhttp.open("GET", path, true);
  xhttp.send();
}
