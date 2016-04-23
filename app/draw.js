import d3 from "d3";

export default draw;

let previousContainer;

function draw(fsm, container) {

  // Gather width and height from labels
  // Layout
  // Draw
  cleanup(previousContainer);
  
  let svg = d3.select(container).append("svg");

  let states = Array.from(fsm.states.all());
  let edges = Array.from(fsm.edges.all());

  const statesG = svg.selectAll(".state")
  .data(states).enter()
  .append("g")
  .attr("class", "state");

  const edgesG = svg.selectAll(".edge")
  .data(edges).enter()
  .append("g")
  .attr("class", "edge");

  const text = statesG
  .append("text")
  .text((d) => d.label());
  
  log.debug(text.data());
  
  log.debug(text);
  for(let s of states) {
    const bb = boundingBox(s.label(), svg);
    s.width(bb.width).height(bb.height);
  }
  for(let e of edges) {
    const bb = boundingBox(e.label, svg);
    e.width(bb.width).height(bb.height);
  }

  fsm.layout();

  log.debug(fsm);

  statesG.append("ellipse")
  .attr("rx", (d) => d.width()/Math.sqrt(2))
  .attr("ry", (d) => d.height()/Math.sqrt(2))
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y())
  .style("fill", "#44AAFF");

  statesG.filter((d) => d.initial);

  statesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .text((d) => d.label());

  edgesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .text((d) => d.label);

  log.debug(edges);
  let points = Array.prototype.concat.apply([],edges.map((e) => e.points));
  log.debug(points);
  svg.selectAll(".point")
  .data(points).enter()
  .append("circle")
  .attr("class", "point")
  .attr("r", 3)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .style("fill", "#FFAAAA");

  previousContainer = container;
}

function boundingBox(str, svg) {
  return { width: 50, height: 50};
}

const cleanup = (container) => {
  if(container === undefined) { return; }
  container = d3.select(container);
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child);
  }
};
