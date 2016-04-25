import {exception} from "../lib/utils/check";
import pipeline from "../lib/pipeline";
import {default as stringifyError, firstError} from "../lib/error";

const errors = [
  "ALDToken",
  "existingId",
  "wrongType",
  "unknownProp",
  "syntax",
  "unknownId",
  "fsmType",
  "MBToken"
];

export default function main() {
  const container = document.getElementsByClassName("container")[0];
  for(let e of errors) {
    const row = document.createElement("div");
    row.id = `error-${e}`;
    row.classList.add("row", "bottom");
    container.appendChild(row);
    const autospec = document.createElement("div");
    autospec.classList.add("autospec", "one-half", "column");
    const textarea = document.createElement("textarea");
    const path = `errors/${e}.aml`;
    textarea.readonly = true;
    autospec.appendChild(textarea);
    row.appendChild(autospec);
    const errorLog = document.createElement("div");
    errorLog.classList.add("errorlog", "one-half", "column");
    row.appendChild(errorLog);
    populate(textarea, errorLog, path);
  }
}

function populate(textarea, errorLog, path) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      textarea.value = xhttp.responseText;
      const fsm = pipeline(textarea.value);
      if(!exception(fsm)) {
        log.error("Waiting for an error from " + path);
        log.error(fsm);
        return;
      }
      const errorTA = document.createElement("textarea");
      errorTA.value = stringifyError(firstError(fsm));
      errorLog.appendChild(errorTA);
    }
  };
  xhttp.open("GET", path, true);
  xhttp.send();
}
