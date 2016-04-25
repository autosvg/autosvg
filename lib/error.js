import { exception } from "./utils/check";

export default function stringifyError (e) {
  let error = firstError(e);
  for(let prop of Object.keys(exception)) {
    log.debug(prop);
    log.debug(exception[prop]);
  }
  return error.name +  " : " + error.dispatch(treat);
}

function firstError(e) {
  log.debug(e);
  return e.dispatch({
    [exception.array]: (e1) => firstError(e1.exceptions.filter((e2) => e2 != null)[0]),
    [exception.object]: (e1) => firstError(e1.exceptions[Object.keys(e1.exceptions)[0]]),
    default: (e1) => e1
  });
}

function translate(e) {
  switch(e.type) {
    case "states":
      return {
      name: "états",
      undefinedArticle: "des "
    };
    case "symbols":
      return {
      name: "symboles",
      undefinedArticle: "des "
    };
    case "state":
      return {
      name: "état",
      undefinedArticle: "d'"
    };
    case "symbol":
      return {
      name: "symbole",
      undefinedArticle: "de "
    };
    default:
      return e.type;
  };
}

function printLoc(loc) {
  return loc.start.line + ":" + loc.start.column;
}

const treat = {
  [exception.ALDToken]: (e) => "Le bloc des " + getType(e) + " redéfini en " + printLoc(e.loc2) + " est déjà défini en " + printLoc(e.loc1),
  [exception.existingId]: (e) => {
    const {name, undefinedArticle} = translate(e.type);
    return `L'identifiant ${undefinedArticle + name} ${e.value} redéfini en ${printLoc(e.loc2)} est déjà défini en ${printLoc(e.loc1)}`;
  },
  [exception.wrongType]: (e) => "La valeur déclarée en " + printLoc(e.loc) + " doit être de type " + e.type,
  [exception.unknownProp]: (e) => "L'attribut " + e.propertyName + " défini en " + printLoc(e.loc) + " n'est pas supporté",
  [exception.syntax]: (e) => `Erreur de syntaxe en ${printLoc(e.location)}. ${e.found} trouvé. Tokens autorisés : ${e.expected.map(function (e) { if(e.value == "[ \\t\\n\\r]") { return  "espace, tabulation, saut de ligne, retour chariot" } else { return e.value }} ).join("\n")}`,
  [exception.unknownId]: (e) => `Identifiant ${e.value} utilisé en ${printLoc(e.loc)} inconnu.`,
  [exception.fsmType]: (e) => `${e.type} (${printLoc(e.loc)}) n'est pas un type d'automate valide.`,
  [exception.MBToken]: (e) => {
    const {name, undefinedArticle} = translate(e.type);
    return `Le bloc ${undefinedArticle + name} est manquant.`;
  },
  default: (e) => log.debug("UNHANDLED ERROR\n" + e.message)
};

