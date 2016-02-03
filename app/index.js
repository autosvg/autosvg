"use strict";

module.exports = (new App());
var create_controller = require("./controller"); 

function App() {
  this.main = function() {
    log.info("Main");
    create_controller();
    log.info(require("../lib").automata());
  };
}
