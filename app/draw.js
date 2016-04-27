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

const edgePathGenerator = d3.svg.line()
.x((d) => d.x)
.y((d) => d.y)
.interpolate("basis");

const sq = (x) => x*x;

const sign = (bool) => (bool|0)*2 - 1;

const intersection = (x, y, tx, ty, a, b) => {
  return {
    x: x + sign(tx > 0)*Math.sqrt(1 / ( sq(1/a) + sq(ty/(b*tx)) )),
    y: y + sign(ty > 0)*Math.sqrt(1 / ( sq(1/b) + sq(tx/(a*ty)) )),
  };
};

const translate = (x, y, tx, ty, d) => {
  const r = d === undefined ? 1 : d/Math.sqrt(sq(tx) + sq(ty));
  return {
    x: x + tx*r,
    y: y + ty*r
  };
};

const drawInitArrow = (statesG, initArrowLength, arrowWidth, terminalSpacing) => {
  statesG.filter((d) => d.initial)
  .append("line")
  .each((d) => {
    const {a, b} = ellipseRadiusFromState(d, terminalSpacing);
    d.arrowPos = {};
    const intersect = intersection(d.x(), d.y(), -1, 0, a, b);
    d.arrowPos.base = {
      x: intersect.x - arrowWidth - d.x(),
      y: intersect.y - d.y()
    };
    d.arrowPos.start = {
      x: d.arrowPos.base.x - initArrowLength,
      y: d.arrowPos.base.y
    };
  })
  .attr("stroke", "black")
  .attr("marker-end", "url(#arrow)")
  .attr({
    x1: (d) => d.x() + d.arrowPos.start.x,
    y1: (d) => d.y() + d.arrowPos.start.y,
    x2: (d) => d.x() + d.arrowPos.base.x,
    y2: (d) => d.y() + d.arrowPos.base.y
  });
};

const fixIntersection = (center, controlPoint, semimajor, semiminor) => {
  return intersection(
    center.x, center.y,
    controlPoint.x - center.x, controlPoint.y - center.y,
    semimajor, semiminor
  );
};

const ellipseRadiusFromState = (s, terminalSpacing) => {
  const pad = s.terminal ? terminalSpacing : 0;
  return {
    a: s.width()/Math.sqrt(2) + pad,
    b: s.height()/Math.sqrt(2) + pad
  };
};

const norm = (x, y) => Math.sqrt(sq(x) + sq(y));

const drawEdgePaths = (edgesG) => {
  edgesG
  .append("path")
  .attr("marker-end", "url(#arrow)");
};

const updateEdgePaths = (paths, arrowWidth, terminalSpacing) => {
  paths.attr("d", (d) => {
    const points = d.points;
    let a, b;
    ({a, b} = ellipseRadiusFromState(d.from, terminalSpacing));
    points[0] = fixIntersection(points[0], points[1], a, b);
    ({a, b} = ellipseRadiusFromState(d.to, terminalSpacing));
    let controlPoint = points[points.length - 2];
    let tip = fixIntersection(points[points.length - 1], controlPoint, a, b);
    if(norm(controlPoint.x - tip.x, controlPoint.y - tip.y) < arrowWidth) {
      // FIXME: That's an ugly hack for when the base of arrowhead is farther
      // that the control point
      controlPoint = translate(
        controlPoint.x, controlPoint.y,
        (points[points.length - 3].x - controlPoint.x)/3,
        (points[points.length - 3].y - controlPoint.y)/3
      );
      tip = fixIntersection(points[points.length - 1], controlPoint, a, b);
      points[points.length - 2] = controlPoint;
    }
    const base = translate(
      tip.x, tip.y,
      controlPoint.x - tip.x, controlPoint.y - tip.y,
      arrowWidth
    );
    points[points.length - 1] = base;
    return edgePathGenerator(points);
  });
};

const defineArrowHead = (defs, width, height) => {
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
  const arrowWidth = 7;
  const terminalSpacing = 3;
  const initArrowLength = arrowWidth;
  defineArrowHead(defs, arrowWidth, 5);

  // Container
  const g = svg.append("g");
  svg.call(d3.behavior.zoom().on("zoom", zoom(g)));

  // Groups
  const statesG = g.selectAll(".state")
  .data(Array.from(fsm.states.all())).enter()
  .append("g")
  .attr("class", "state")
  .attr("id", (d) => `state_${d.id}`)
  .each((d) => {
    d.edges = new Set();
  });

  const edgesG = g.selectAll(".edge")
  .data(Array.from(fsm.edges.all())).enter()
  .append("g")
  .attr("class", "edge")
  .attr("id", (d) => `edge_${d.from.id}_${d.to.id}`)
  .each(function(d) {
    d.from.edges.add(this);
    d.to.edges.add(this);
  });

  // Measure
  stateDimensions(statesG, 12);
  edgeDimensions(edgesG, 20, 4, 2);

  // Compute layout
  fsm.layout();

  // Account for ellipses and arrowheads
  // fixIntersections(edgesG, arrowWidth);

  // If needed
  drawDebug(statesG, edgesG, g);

  // Render
  drawEllipses(statesG, terminalSpacing);
  drawInitArrow(statesG, initArrowLength, arrowWidth, terminalSpacing);
  drawStateLabels(statesG);
  drawEdgePaths(edgesG);
  drawEdgeLabels(edgesG);

  updateEdgePaths(edgesG.selectAll("path"), arrowWidth, terminalSpacing);
  
  // Drag'n'Drop
  const drag = d3.behavior.drag()
  .on("drag", function(d) {
    d.x(d3.event.x).y(d3.event.y);
    updateState(d3.select(this), arrowWidth, terminalSpacing);
  });

  statesG.call(drag);
}

const updateState = (sG, arrowWidth, terminalSpacing) => {
  sG.selectAll("ellipse")
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y());

  sG.selectAll("text")
  .attr("x", (d) => d.x())
  .attr("y", (d) => d.y());

  sG.selectAll("line")
  .attr({
    x1: (d) => d.x() + d.arrowPos.start.x,
    y1: (d) => d.y() + d.arrowPos.start.y,
    x2: (d) => d.x() + d.arrowPos.base.x,
    y2: (d) => d.y() + d.arrowPos.base.y
  });

  updateEdgePaths(
    d3.selectAll(Array.from(sG.datum().edges)).selectAll("path"),
    arrowWidth, terminalSpacing
  );
};

const drawEllipses = (statesG, terminalSpacing) => {
  statesG.append("ellipse")
  .attr("class", "contour")
  .attr("rx", (d) => d.width()/Math.sqrt(2))
  .attr("ry", (d) => d.height()/Math.sqrt(2))
  .attr("cx", (d) => d.x())
  .attr("cy", (d) => d.y());

  statesG.filter((d) => d.terminal)
  .append("ellipse")
  .attr("class", "doubling")
  .attr("rx", (d) => d.width()/Math.sqrt(2) + terminalSpacing)
  .attr("ry", (d) => d.height()/Math.sqrt(2) + terminalSpacing)
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
    (d) => d.lines.length > 1 ? "text-before-edge" : "central"
  ).html((d) => gatherLines(d.lines, d.x(), -d.height()/2));

};

const zoom = (g) => () => {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

const drawDebug = (statesG, edgesG, svg) => {
  statesG
  .append("rect")
  .attr("class", "debug-rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#55CCFF");

  edgesG
  .append("rect")
  .attr("class", "debug-rect")
  .attr("x", (d) => d.x() - d.width()/2)
  .attr("y", (d) => d.y() - d.height()/2)
  .attr("width", (d) => d.width())
  .attr("height", (d) => d.height())
  .style("fill", "#AAFFAA");

  edgesG
  .selectAll(".debug-circle")
  .data((d) => d.points)
  .enter()
  .append("circle")
  .attr("class", "debug-circle")
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
