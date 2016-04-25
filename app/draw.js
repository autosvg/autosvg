import d3 from "d3";
export default draw;

const stateDimensions = (statesG, minRadius=0) => {
  const text = statesG
  .append("text")
  .html((d) => d.label());

  const data = text.data();
  const nodes = text[0];

  for(let i = 0, bbox; i < data.length; i++) {
    bbox = nodes[i].getBBox();
    data[i]
    .width(Math.max(minRadius*2, bbox.width))
    .height(Math.max(minRadius*2, bbox.height));
    nodes[i].remove();
  } 
};

const gatherLines = (lines, x, dy=0) => {
  if(lines.length === 1) {
    return lines[0].join(", ");
  }
  return lines.map((l, i) => {
    const end = i < lines.length - 1 ? "," : "";
    if(i == 0) {
      return `<tspan x=${x} dy=${dy}>${l.join(", ")}${end}</tspan>`;
    }
    return `<tspan x=${x} dy="8pt">${l.join(", ")}${end}</tspan>`;
  }).join("");
};

const edgeDimensions = (edgesG, maxWidth, minRadius=0, padRadius=0) => {
  const text = edgesG
  .append("text");

  const data = text.data();
  const nodes = text[0];

  for(let i = 0, node, labels, lines; i < data.length; i++) {
    node = nodes[i];
    labels = data[i].symbols.map((a) => a.label);
    lines = [];
    for(let j = 0; j < labels.length; j++) {
      node.innerHTML = labels[j];
      let k = 1;
      while(node.getBBox().width < maxWidth && j + k < labels.length) {
        node.innerHTML = node.innerHTML + ", " + labels[j + k];
        k++;
      }
      lines.push(labels.slice(j, j + k));
      j = j + k - 1;
    }
    data[i].lines = lines;
    node.innerHTML = gatherLines(data[i].lines, 0);
    const {width, height} = node.getBBox();
    data[i]
    .width(Math.max(minRadius*2, width + padRadius*2))
    .height(Math.max(minRadius*2, height + padRadius*2));
    node.remove();
  }
};

const lineGenerator = d3.svg.line()
  .x((d) => d.x)
  .y((d) => d.y)
  .interpolate("bundle")
  .tension(0.7);

const sq = (x) => x*x;

const sign = (b) => (b|0)*2 -1;

const intersection = (h, w, xA, yA, x0, y0) => {
  return {
    x: x0 + sign(xA > x0)*Math.sqrt(0.5 / ( sq(1/w) + sq((yA - y0)/(h*(xA - x0))) )),
    y: y0 + sign(yA > y0)*Math.sqrt(0.5 / ( sq(1/h) + sq((xA - x0)/(w*(yA - y0))) )),
  };
};

const applyOffset = (offset, x, y, x0, y0) => {
  const r = offset/Math.sqrt(sq(x - x0) + sq(y - y0));
  return {
    x: x + (x - x0)*r,
    y: y + (y - y0)*r
  };
};

const fixIntersections = (edges, offset=0) => {
  let from, to, points, start, end, newStart, newEnd;
  for(let e of edges) {
    from = e.from;
    to = e.to;
    points = e.points();
    start = points[0];
    end = points[points.length - 1];
    newStart = intersection(
      from.height(), from.width(),
      start.x, start.y,
      from.x(), from.y()
    );
    newEnd = intersection(
      to.height(), to.width(),
      end.x, end.y,
      to.x(), to.y()
    );
    points.splice(1, 0, newStart);
    points.splice(points.length-1, 0,
                  applyOffset(offset, newEnd.x, newEnd.y, to.x(), to.y()));
    e.points(points);
  }
};

function draw(fsm, container, cfg) {

  // Gather width and height from labels
  // Layout
  // Draw
  cleanup(container);

  const svg = d3
  .select(container)
  .append("svg");

  const defs = svg.append("defs");

  const arrowWidth = 8;
  const arrowHeight = 6;

  defs.append("marker")
  .attr({
    "id":"arrow",
    "refX":0,
    "refY":arrowHeight/2,
    "markerWidth": arrowWidth,
    "markerHeight":arrowHeight,
    "markerUnits": "userSpaceOnUse",
    "orient":"auto"
  }).append("path")
  .attr("d", `M0,0 L0,${arrowHeight} L${arrowWidth},${arrowHeight/2} z`)
  .attr("class","arrowHead");

  const g = svg.append("g");
  svg.call(d3.behavior.zoom().on("zoom", zoom(g)));

  const states = Array.from(fsm.states.all());
  const edges = Array.from(fsm.edges.all());


  const edgesG = g.selectAll(".edge")
  .data(edges).enter()
  .append("g")
  .attr("class", "edge");

  const statesG = g.selectAll(".state")
  .data(states).enter()
  .append("g")
  .attr("class", "state");

  stateDimensions(statesG, 12);
  edgeDimensions(edgesG, 20, 4, 2);

  fsm.layout();

  fixIntersections(edges, arrowWidth);

  drawEllipses(statesG);


  // statesG.filter((d) => d.initial);

  showControlPoints(edges, g);

  edgesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr(
    "dominant-baseline",
    (d) => d.lines.length > 1 ? "text-before-edge" : "central")
  .html((d) => gatherLines(d.lines, d.x(), -d.height()/2));

  statesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central")
  .html((d) => d.label());

  edgesG.append("path")
  .attr("d", (d) => {
    const points = d.points();
    points.splice(0, 1);
    points.splice(points.length - 1, 1);
    return lineGenerator(points);
  })
  .attr("marker-end", "url(#arrow)");


}

const drawEllipses = (statesG) => {
  statesG.append("ellipse")
  .attr("rx", (d) => d.width()/Math.sqrt(2))
  .attr("ry", (d) => d.height()/Math.sqrt(2))
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y());
};

const zoom = (g) => () => {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

const showControlPoints = (edges, svg) => {

  const points = Array.prototype.concat.apply([],edges.map((e) => e.points()));
  svg.selectAll(".point")
  .data(points).enter()
  .append("circle")
  .attr("class", "point")
  .attr("r", 1.5)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .style("fill", "#FF7777");

  svg.selectAll(".state")
  .append("rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#55CCFF");

  svg.selectAll(".edge")
  .append("rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#AAFFAA");

};

const cleanup = (container) => {
  if(container === undefined) { return; }
  container = d3.select(container);
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child);
  }
};
