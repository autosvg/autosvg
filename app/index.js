import controller from "./controller";
import { serialize, deserialize } from "../lib/json";

export default function main() {
  defaultJSON("example.json");
  controller();
}

function defaultJSON(file) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      log.warn(serialize(deserialize(xhttp.responseText)));
      document
        .getElementById("autospec")
        .getElementsByTagName("textarea")[0]
        .value = xhttp.responseText;
    }
  };
  xhttp.open("GET", file, true);
  xhttp.send();
}
