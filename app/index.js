"use strict";

module.exports = (new App());

function App() {
  this.main = function() {
    log.info("Main");
    log.info(require("../lib").automata());
  };
}
