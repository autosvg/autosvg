"use strict";

module.exports = create_controller;

function create_controller () {
  //SVG namespace
  var namespace = "http://www.w3.org/2000/svg";
  var bGeneration = document.getElementById("bGeneration");
  bGeneration.addEventListener("click", function () {
    var canvas_container = document.getElementById("autoimg"); 
    var canvas = document.createElementNS(namespace, "svg");
    var circle = document.createElementNS(namespace, "circle");
    /* The three followings lines defines a circle of center 0,0 and radius 10*/
    circle.setAttribute("cx", 0);
    circle.setAttribute("cy", 0);
    circle.setAttribute("r", 10);
    canvas.appendChild(circle);
    canvas_container.appendChild(canvas);
  });
}
