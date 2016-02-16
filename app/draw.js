"use strict";

module.exports = draw;

const svgjs = require("svg.js")

function draw(automata, container) {

  let width = 960,
    height = 500;

  let svg = SVG(container).size(width, height);
  
  let stateRadius = 10;
  //Process the states
  automata.states.forEach((s) => {
    svg.circle(stateRadius*2)
      .attr({ cx: s.x, cy: s.y})
      .click(() => log.info(s));
  });
  //Process the transitions (ignoring the label)
  automata.transitions.forEach((t) => {
    let x1 = t.source.x,
        y1 = t.source.y,
        x2 = t.target.x,
        y2 = t.target.y
    //Main line
    svg.line(x1, y1, x2, y2)
      .stroke({width: 3})
      .on('mouseover', function () { this.stroke({color: '#f00'}) })
      .on('mouseout', function () { this.stroke({color: '#000'}) });
                  
    
  });

}
