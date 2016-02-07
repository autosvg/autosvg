"use strict";

module.exports = draw;

const d3 = require("d3");

function draw(automata, container) {

  let width = 960,
    height = 500;

  let svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.selectAll(".state")
    .data(automata.states)
    .enter().append("circle")
    .attr("class", "state")
    .attr("r", 10)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .on("click", (d) => { log.debug(d); })
    .style("fill", () => "#55FFEE");

}
