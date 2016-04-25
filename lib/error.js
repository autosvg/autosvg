import { exception } from "./utils/check";

export default function stringifyError (e) {
  let error = firstError(e);
  for(let prop of Object.keys(exception)) {
    log.debug(prop);
    log.debug(exception[prop]);
  }
  return error.name +  " : " + error.dispatch({
    [exception.ALDToken]: (e1) => treatALDException(e1),
    [exception.MBToken]: (e1) => "Le bloc des " + getType(e1) + " est manquant.",
    [exception.missingValue]: (e1) => log.debug(e1),
    default: (e1) => log.debug(e1)
  });
}

function firstError(e) {
  log.debug(e);
  return e.dispatch({
   [exception.array]: (e1) => firstError(e1.exceptions.filter((e2) => e2 != null)[0]),
   [exception.object]: (e1) => firstError(e1.exceptions[Object.keys(e1.exceptions)[0]]),
   default: (e1) => e1
 });
}

function getType (e) {
  let type;
  switch(e.type) {
    case "states":
      type = "états";
      break;
    case "symbols":
      type = "symboles";
      break;
    default:
      type = e.type;
      break;
  };
  return type;
}

function treatALDException (e) {
  return "Le bloc des " + getType(e) + " redéfini ici : " + e.loc2.start.line + ":" + e.loc2.start.column
    + " est déjà défini ici : " + e.loc1.start.line + ":" + e.loc1.start.column;
}
      
