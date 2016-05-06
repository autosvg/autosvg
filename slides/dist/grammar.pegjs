{
    function setAttrs(obj, attrs) {
        if(attrs != null) {
            for (var i = 0; i < attrs.length; i++) {
              Object.assign(obj, attrs[i]);
            }
        }
        return obj;
    }

    let defaults = {
    };

    let data = {
    };
}

start =
  t:type ws attrs:(attrs?) a:automaton_block
  { 
    let automaton = new Object();
    automaton.type = t;
    automaton.defaults = defaults
    if(data.transitions == null) {
      expected("transitions block");
    }
    automaton.data = data;
    setAttrs(automaton, attrs);
    return automaton;
  }


type =
    "finite automaton"

automaton_block =
  block_start blocks:blocks block_end 

blocks =
  block*

block =
  states_block
  / symbols_block
  / transitions_block

states_block =
  t:"states" ws attrs:(attrs?) block_start s:states block_end
  {
    if(data.states == null) {
      data.states = s;
      setAttrs(defaults.states, attrs);
    } else {
      expected("Multiple declarations of states block");
    }
  }

symbols_block =
  t:"symbols" ws attrs:(attrs?) block_start s:symbols block_end
  {
    if(data.symbols == null) {
      data.symbols = s;
      setAttrs(defaults.symbols, attrs);
    } else {
      expected("Multiple declarations of symbols block");
    }
  }

transitions_block =
  t:"transitions" ws attrs:(attrs?) block_start t:transitions block_end
  {
    if(data.transitions == null) {
      data.transitions = t;
      setAttrs(defaults.transitions, attrs);
    } else {
      expected("Multiple declarations of transitions block");
    }
  }

states =
  state*

symbols =
  symbol*

transitions =
  transitions:(transition*)
  {
    let ts = new Array();
    for(var i = 0; i < transitions.length; i++) {
      for(var j = 0; j < transitions[i].to.length; j++) {
        let new_t = new Object();
        new_t.from = transitions[i].from;
        new_t.by = transitions[i].by;
        new_t.to = transitions[i].to[j];
        ts.push(setAttrs(new_t, transitions[i].attrs));
      }
    }
    return ts;
  }

state =
  id:identifier ws attrs:(attrs?)
  {
    return setAttrs({id}, attrs);
  }

symbol =
  id:identifier ws attrs:(attrs?)
  {
    return setAttrs({id}, attrs);
  }

transition =
  from:identifier ws by:identifier ws "->"  ws to:list_identifier ws  attrs:(attrs?) ws
  {
    return {from, by, to, attrs};
  }


list_identifier =
    i:identifier "," l:list_identifier { return new Array(i).concat(l);}
    / i:identifier { return new Array(i) };


attrs =
    "[" attrs:(attr*) "]" ws { return attrs; }

attr =
    name:identifier ws "=" ws value:boolean ws { let obj = {}; obj[name] = (value == "true"); return obj; }
    / name:identifier ws "=" ws color:color ws { let obj = {}; obj[name] = color; return obj; }
    / name:identifier ws "=" ws value:quoted_string ws  { let obj = {}; obj[name] = value; return obj; } 
    / name:identifier ws { let obj = {}; obj[name] = true; return obj;}
     

identifier =
    $([a-zA-Z_0-9]+)

string =
    identifier

quoted_string =
   "\"" str:$string "\"" { return str; }

color =
    color:$("#" $(hexdigit hexdigit hexdigit hexdigit hexdigit hexdigit / hexdigit hexdigit hexdigit)) { return color }
    
hexdigit =
    ([a-fA-F0-9])

boolean = 
    "true"
    / "false"

block_start =
   ws "{" ws 

block_end =
    ws "}" ws 

ws = 
    [ \t\n\r]* 
