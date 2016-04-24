import grammar from "./grammar";
import {exception} from "../utils/check";

exception.syntax = exception.register(
    "SyntaxException", 
    function (excepted, found, location) {
      this.excepted = excepted;
      this.found = found;
      this.location = location;
    }
);

function parse(aml) {
  let l;
  try {
    l = grammar.parse(aml);
  } catch (err) {
    if(err instanceof grammar.SyntaxError) {
      return exception.create(exception.syntax, err.expected, err.found, err.location); 
    } else {
      return err;
    }
  }
  return l;
}

export default { parse };
