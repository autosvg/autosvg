import d3 from "d3";

export default draw;

let previousContainer;

function draw(fsm, container) {

  // Gather width and height from labels
  // Layout
  // Draw
  cleanup(previousContainer);
  
  let states = Array.from(fsm.states.all());
  let edges = Array.from(fsm.edges.all());
  for(let s of states) {
    const bb = boundingBox(s.label(), container);
    s.width(bb.width).height(bb.height);
    log.debug(s);
  }
  for(let e of edges) {
    const bb = boundingBox(e.label, container);
    e.width(bb.width).height(bb.height);
  }

  fsm.layout();

  let svg = d3.select(container).append("svg");
  log.debug(fsm);
  log.debug(svg);
  svg.selectAll(".state")
  .data(states).enter()
  .append("ellipse")
  .attr("class", "state")
  .attr("rx", (d) => log.debug(d))
  .attr("rx", (d) => d.width())
  .attr("ry", (d) => d.height())
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y())
  .style("fill", "#44AAFF");

  svg.selectAll(".stateLabel")
  .data(states).enter()
  .append("text")
  .attr("class", "stateLabel")
  .attr("x", cornerX)
  .attr("y", cornerY)
  .text((d) => d.label());

  svg.selectAll(".edgeLabel")
  .data(edges).enter()
  .append("text")
  .attr("class", "edgeLabel")
  .attr("x", cornerX)
  .attr("y", cornerY)
  .text((d) => d.label);

  log.debug(edges);
  let points = Array.prototype.concat.apply([],edges.map((e) => e.points));
  log.debug(points);
  svg.selectAll(".edge")
  .data(points).enter()
  .append("circle")
  .attr("class", "edge")
  .attr("r", 3)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .style("fill", "#FFAAAA");

  previousContainer = container;
}

function boundingBox(str, container) {
  return { width: 50, height: 50};
}

const cornerX = (obj) => obj.x() - obj.width()/2;
const cornerY = (obj) => obj.y() - obj.height()/2;

const cleanup = (container) => {
  if(container === undefined) { return; }
  container = d3.select(container);
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child);
  }
};
