import draw from "./draw";
import layout from "./layout";

export default function controller() {
  document
    .getElementById("bGeneration")
    .addEventListener("click", () => {
      let container = document.getElementById("autoimg"); 
      cleanup(container);
      let automata = JSON.parse(document
        .getElementById("autospec")
        .getElementsByTagName("textarea")[0]
        .value);
      layout().automata(automata).lay();
      draw(automata, "autoimg");
    });
}

function cleanup(container) {
  let child;
  while((child = container.firstChild)) {
    container.removeChild(child); 
  }
}

