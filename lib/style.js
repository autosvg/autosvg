export default function fsmStyle(fsm) {

  const states = new WeakMap();
  const transitions = new WeakMap();
  const symbols = new WeakMap();

  const stateStyle = (s) => states.get(s);
  const transitionStyle = (t) => transitions.get(t);
  const symbolStyle = (a) => symbols.get(a);

  const defaultStateStyle = {
  };
  const defaultTransitionStyle = {
  };
  const defaultSymbolStyle = {
  };
  
  Object.defineProperties(fsm.statePrototype, {
  });

  Object.defineProperties(fsm.transitionPrototype, {
  });

  Object.defineProperties(fsm.symbolPrototype, {
  });
  
  const stateBuilder = fsm.state;
  fsm.state = (content) => {
    const builder = stateBuilder(content);
    const style = Object.assign({}, defaultStateStyle);

    return builder;
  };

  const transitionBuilder = fsm.transition;
  fsm.transition = (content) => {
    const builder = transitionBuilder(content);
    const style = Object.assign({}, defaultTransitionStyle);

    return builder;
  };

  const symbolBuilder = fsm.symbol;
  fsm.symbol = (content) => {
    const builder = symbolBuilder(content);
    const style = Object.assign({}, defaultSymbolStyle);

    return builder;
  };

  return fsm;
};
