"use strict";

module.exports = parser;

const PEG = require("pegjs");
const start = "START=\n AXIOM\n";
const AXIOM = "AXIOM=\n (A/B)* \n";
const A = "A=\n 'a'+\n";
const B = "B=\n 'b'+\n";
const eps = "";



function parser() {

    log.debug(PEG);
    log.debug(start + AXIOM + A + B);
    return PEG.buildParser(start + AXIOM + A + B);
}