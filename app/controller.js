"use strict";

module.exports = create_controller;

function create_controller () {
  var bGeneration = document.getElementById("bGeneration");
  bGeneration.addEventListener("click", function () {
    var canvas_container = document.getElementById("autoimg"); 
    var canvas = document.createElement("svg");
    var circle = document.createElement("circle");
    canvas.setAttribute("width", canvas_container.getAttribute("width"));
    canvas.setAttribute("height", canvas_container.getAttribute("height"));
    circle.setAttribute("cx", canvas.getAttribute("width"));
    circle.setAttribute("cy", canvas.getAttribute("height"));
    circle.setAttribute("r", 10);
    canvas.appendChild(circle);
    canvas_container.appendChild(canvas);
  });
}
