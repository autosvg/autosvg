/* placement.js */

module.exports = Placement;

function Position(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype = {
  getX: function () {
    return this.x;
  },
  getY: function () {
    return this.y;
  },
  setX: function (x) {
    this.x = x;
  },
  setY: function (y) {
    this.y = y;
  }
};

function Placement () { 
  this.states = {};
}

Placement.prototype = {
  addStatePosition: function (state, x, y) {
    this.states[state] = new Position(x, y);
  },
  deleteStatePosition: function (state) {
    delete this.states[state];
  },
  getStatePosition: function (state) {
    return this.states[state];
  }
};
