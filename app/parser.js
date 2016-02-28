"use strict";

module.exports = parser();

const PEG = require("pegjs");
const grammar = "start = ('a' /'b')+"

function parser() {
  log.debug(PEG);
  return PEG.buildParser(grammar);
}
