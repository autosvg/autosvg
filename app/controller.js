"use strict";

module.exports = controller;

const draw = require("./draw");
const layout = require("./layout");
const Parser = require("./parser");


function cleanup(container) {
    let child;
    while ((child = container.firstChild)) {
        container.removeChild(child);
    }
}

function controller() {

    var parser = new Parser();

    document.addEventListener('DOMContentLoaded', function() {

        parser.loadGrammar("grammar.pegjs");

    });

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

            //log.debug(parser().parse(l));
            log.debug(parser.buildParser().parse(l));

        });
}