import d3 from "d3";

export default draw;

let previousContainer;

const stateDimensions = (statesG, minRadius) => {
  const text = statesG
  .append("text")
  .text((d) => d.label());

  const data = text.data();
  const nodes = text[0];

  for(let i = 0, bbox; i < data.length; i++) {
    bbox = nodes[i].getBBox();
    data[i]
    .width(Math.max(minRadius*2, bbox.width))
    .height(Math.max(minRadius*2, bbox.height));
  } 
};

const edgeDimensions = (edgesG, minRadius) => {
  const text = edgesG
  .append("text")
  .text((d) => d.label);

  const data = text.data();
  const nodes = text[0];

  for(let i = 0, bbox; i < data.length; i++) {
    bbox = nodes[i].getBBox();
    data[i]
    .width(Math.max(minRadius*2, bbox.width))
    .height(Math.max(minRadius*2, bbox.height));
  } 
};

function draw(fsm, container) {

  // Gather width and height from labels
  // Layout
  // Draw
  cleanup(container);
  
  let svg = d3.select(container).append("svg");
  let states = Array.from(fsm.states.all());
  let edges = Array.from(fsm.edges.all());

  const edgesG = svg.selectAll(".edge")
  .data(edges).enter()
  .append("g")
  .attr("class", "edge");

  const statesG = svg.selectAll(".state")
  .data(states).enter()
  .append("g")
  .attr("class", "state");

  stateDimensions(statesG, 15);
  edgeDimensions(edgesG, 5);


  fsm.layout();

  edgesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central")
  .text((d) => d.label);

  statesG.append("ellipse")
  .attr("rx", (d) => d.width()/Math.sqrt(2))
  .attr("ry", (d) => d.height()/Math.sqrt(2))
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y());

  // showControlPoints(edges, states, svg);

  const lineGenerator = d3.svg.line()
  .x((d) => d.x)
  .y((d) => d.y)
  .interpolate("linear");

  edgesG.append("path")
  .attr("d", (d) => lineGenerator(d.points));

  // statesG.filter((d) => d.initial);

  statesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central")
  .text((d) => d.label());

}

const showControlPoints = (edges, states, svg) => {

  const points = Array.prototype.concat.apply([],edges.map((e) => e.points));
  svg.selectAll(".point")
  .data(points).enter()
  .append("circle")
  .attr("class", "point")
  .attr("r", 3)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .style("fill", "#FFAAAA");

  svg.selectAll(".state")
  .append("rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#33AAFF");

};

const cleanup = (container) => {
  if(container === undefined) { return; }
  container = d3.select(container);
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child);
  }
};
