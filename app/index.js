import controller from "./controller";

export default function main() {
  defaultJSON("example.json");
  controller();
}

function defaultJSON(file) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      document
        .getElementById("autospec")
        .getElementsByTagName("textarea")[0]
        .value = xhttp.responseText;
    }
  };
  xhttp.open("GET", file, true);
  xhttp.send();
}
