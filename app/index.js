"use strict";

module.exports = (new App());
const controller = require("./controller");

function App() {
  this.main = () => {
    //defaultJSON("example.json");
    controller();
  };
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
