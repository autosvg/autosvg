"use strict";

if (typeof global !== "undefined") {
  global.log = require("loglevel");
}

exports.automata = require("./automata").automata;
