import d3 from "d3";
export default draw;

const stateDimensions = (statesG, minRadius=0) => {
  const text = statesG
  .append("text")
  .html((d) => d.label);

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
  .interpolate("basis");

const sq = (x) => x*x;

const sign = (bool) => (bool|0)*2 - 1;

const intersection = (h, w, xA, yA, x0, y0) => {
  return {
    x: x0 + sign(xA > x0)*Math.sqrt(0.5 / ( sq(1/w) + sq((yA - y0)/(h*(xA - x0))) )),
    y: y0 + sign(yA > y0)*Math.sqrt(0.5 / ( sq(1/h) + sq((xA - x0)/(w*(yA - y0))) )),
  };
};

const translate = (x, y, tx, ty, d) => {
  const r = d === undefined ? 1 : d/Math.sqrt(sq(tx) + sq(ty));
  return {
    x: x + tx*r,
    y: y + ty*r
  };
};

const fixIntersections = (edgesG, offset=0) => {
  const edges = edgesG.data();
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
    points.splice(points.length-1, 0, translate(
      newEnd.x, newEnd.y,
      newEnd.x - to.x(), newEnd.y - to.y(),
      offset));
    e.points(points);
  }
};

const defineArrowHead = (defs, height, width) => {
  defs.append("marker")
  .attr({
    "id":"arrow",
    "refX":0,
    "refY":height/2,
    "markerWidth": width,
    "markerHeight":height,
    "markerUnits": "userSpaceOnUse",
    "orient":"auto"
  }).append("path")
  .attr("d", `M0,0 L0,${height} L${width},${height/2} z`)
  .attr("class","arrowHead");
};

function draw(fsm, container) {

  // Init
  cleanup(container);
  const svg = d3
  .select(container)
  .append("svg");

  // Defs
  const defs = svg.append("defs");
  const arrowWidth = 8;
  defineArrowHead(defs, 6, arrowWidth);

  // Container
  const g = svg.append("g");
  svg.call(d3.behavior.zoom().on("zoom", zoom(g)));
  
  // Groups
  const statesG = g.selectAll(".state")
  .data(Array.from(fsm.states.all())).enter()
  .append("g")
  .attr("class", "state")
  .attr("id", (d) => `state_${d.id}`);
  const edgesG = g.selectAll(".edge")
  .data(Array.from(fsm.edges.all())).enter()
  .append("g")
  .attr("class", "edge")
  .attr("id", (d) => `edge_${d.from.id}_${d.to.id}`);
  
  // Measure
  stateDimensions(statesG, 12);
  edgeDimensions(edgesG, 20, 4, 2);
  
  // Compute layout
  fsm.layout();
  
  // Account for ellipses and arrowheads
  fixIntersections(edgesG, arrowWidth);
  
  // If needed
  drawDebug(statesG, edgesG, g);
  
  // Render
  drawEllipses(statesG);
  drawStateLabels(statesG);
  drawEdgePaths(edgesG);
  drawEdgeLabels(edgesG);

}

const drawEdgePaths = (edgesG) => {
  edgesG.append("path")
  .attr("d", (d) => {
    const points = d.points();
    points.splice(0, 1);
    points.splice(points.length - 1, 1);
    return lineGenerator(points);
  })
  .attr("marker-end", "url(#arrow)");
};

const drawEllipses = (statesG) => {
  statesG.append("ellipse")
  .attr("rx", (d) => d.width()/Math.sqrt(2))
  .attr("ry", (d) => d.height()/Math.sqrt(2))
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y());
};

const drawStateLabels = (statesG) => {
  statesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "central")
  .html((d) => d.label);
};

const drawEdgeLabels = (edgesG) => {
  edgesG.append("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y())
  .attr("text-anchor", "middle")
  .attr(
    "dominant-baseline",
    (d) => d.lines.length > 1 ? "text-before-edge" : "central")
  .html((d) => gatherLines(d.lines, d.x(), -d.height()/2));

};

const zoom = (g) => () => {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

const drawDebug = (statesG, edgesG, svg) => {
  statesG
  .append("rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#55CCFF");

  edgesG
  .append("rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#AAFFAA");

  edgesG
  .selectAll(".point")
  .data((d) => d.points())
  .enter()
  .append("circle")
  .attr("class", "point")
  .attr("r", 1.5)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .style("fill", "#FF7777");
};

const cleanup = (container) => {
  if(container === undefined) { return; }
  container = d3.select(container);
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child);
  }
};
