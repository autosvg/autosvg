import controller from "./controller";

export default function main() {
  defaultText("example.aml");
  controller();
}

function defaultText(file) {
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
