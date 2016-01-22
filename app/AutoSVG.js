"use strict";

var l = require("loglevel");

module.exports = (new AutoSVG());

function AutoSVG() {
  this.main = function() {
    l.info("Main");
  }
}
