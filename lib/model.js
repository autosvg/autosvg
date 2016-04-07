/* model.js */

module.exports = Model;

const Psautomaton = require("./psautomaton");


function Model () {
  this.automata = new Object();
}

Model.prototype = {
  getEmptyAutomaton: function () {
    return new Psautomaton();
  }
};



