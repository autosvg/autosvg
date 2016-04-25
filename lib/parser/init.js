import {exception} from "../utils/check"

const locationToken = Symbol("location token");


function setAttrs(obj, attrs) {
  if(attrs != null) {
    for (var i = 0; i < attrs.data.length; i++) {
      Object.assign(obj, attrs.data[i]);
    }
  }
  return obj;
}

function setLocations(obj, attrs) {
  if(attrs != null) {
    for (var i = 0; i < attrs.location.length; i++) {
      Object.assign(obj, attrs.location[i]);
    }
  }
  return obj;
}

exception.ALDToken = exception.register(
    "AlreadyDefinedException", 
    function (type, loc1, loc2) {
      this.type = type;
      this.loc1 = loc1;
      this.loc2 = loc2;
    }
);

exception.MBToken = exception.register(
    "MissingBlockException",
    function(type) {
      this.type = type;
    }
);


export { setAttrs, setLocations, exception, locationToken};
