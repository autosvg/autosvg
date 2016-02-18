"use strict";

module.exports = draw;

const SVG = require("svg.js");

SVG.extend(SVG.Text, {
  place: function(x, y) {
    return this.attr({
      x: x - this.length()/2,
      y: y
    });
  }
});

function draw(automata, container) {

  let radius = 18;
  let offset = Math.sqrt(radius);

  let svg = SVG(container).viewbox({
    x: 0, y: 0,
    width: 400, height: 600
  });
  

  automata.transitions.forEach((t) => {
    svg.line(t.source.x, t.source.y, t.target.x, t.target.y)
      .stroke({ color: "#000", width: 2 })
      .on("mouseover", function () {
        this.stroke("#f22");
        text.font({
          fill: "#0a0"
        });
      }).on("mouseout", function () {
        this.stroke("#000");
        text.font({
          fill: "#000"
        });
      });

    const text = svg.plain(t.symbol.name)
      .place((t.source.x + t.target.x)/2,
             (t.source.y + t.target.y)/2);
  });

  automata.states.forEach((s) => {
    svg.circle()
      .radius(radius)
      .attr({ cx: s.x, cy: s.y})
      .fill("#fff")
      .stroke({ color: "#000" })
      .click(() => log.info(s));
    svg.plain(s.name)
      .place(s.x, s.y + offset);
  });

}
