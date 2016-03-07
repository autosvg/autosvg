"use strict";

module.exports = Parser;

const PEG = require("pegjs");


function Parser() {
  this.grammar;
}

Parser.prototype = {

  loadGrammar: function(file) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", file, true);

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        this.grammar = xhttp.responseText;
        log.debug(this.grammar);

      }
    };
    xhttp.send(null);
  },

  buildParser: function() {
    return PEG.buildParser(this.grammar);

  }

};
