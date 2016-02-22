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

  let svg = SVG(container);
  svg.node.setAttribute("preserveAspectRatio", "xMidYMid meet");
  // svg.width("100%").height("auto");

  automata.transitions.forEach((t) => {
    t.line = svg.line(t.source.x, t.source.y, t.target.x, t.target.y)
      .stroke({ color: "#000", width: 2 })
      .on("mouseover", function () {
        t.source.circle.stroke("#fa0");
        t.target.circle.stroke("#14a");
        t.line.stroke("#f22");
        t.text.font({
          fill: "#0a0"
        });
      }).on("mouseout", function () {
        t.source.circle.stroke("#000");
        t.target.circle.stroke("#000");
        t.line.stroke("#000");
        t.text.font({
          fill: "#000"
        });
      });

    t.text = svg.plain(t.symbol.name)
      .place((t.source.x + t.target.x)/2,
             (t.source.y + t.target.y)/2);
  });

  automata.states.forEach((s) => {
    s.circle = svg.circle()
      .radius(radius)
      .attr({ cx: s.x, cy: s.y})
      .fill("#fff")
      .stroke({ color: "#000", width: 2})
      .click(() => log.info(s));
    s.text = svg.plain(s.name)
      .place(s.x, s.y + offset);
  });

}
