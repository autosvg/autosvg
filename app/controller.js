"use strict";

module.exports = controller;

const draw = require("./draw");
const layout = require("./layout");
const parser = require("./parser");

function cleanup(container) {
    let child;
    while ((child = container.firstChild)) {
        container.removeChild(child);
    }
}

function controller() {
    document
        .getElementById("bGeneration")
        .addEventListener("click", () => {
            let container = document.getElementById("autoimg");
            cleanup(container);
            /*let automata = JSON.parse(*/
            var l = document
                .getElementById("autospec")
                .getElementsByTagName("textarea")[0]
                .value;
            /*
      layout().automata(automata).lay();
      draw(automata, "autoimg");*/
            log.debug(parser().parse(l));

        });
}