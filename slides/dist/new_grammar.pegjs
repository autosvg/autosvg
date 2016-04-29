{
    function setAttrs(obj, attrs) {
        if(attrs != null) {
            for (var i = 0; i < attrs.length; i++) {
                Object.defineProperty(obj, attrs[i].name, {value: attrs[i].value});
            }
        }
    }
}

start =
    type:automaton_type ws attrs:(attrs?) body:automaton_body
    {   
        let automaton = new Object();
        automaton.type = type;
        automaton.defaults = body.defaults;
        automaton.descriptor = body.descriptor;
        setAttrs(automaton, attrs);
        return automaton;
    }

automaton_type =
    "finite automaton" / "fa"

automaton_body =
    block_start states_block:(states_block?) ws alphabet_block:(alphabet_block?) ws transition_block:(transition_block?) block_end 
    {  
        
        let body = new Object();
        body.descriptor = {
            states: states_block.states,
            symbols: alphabet_block.symbols,
            transitions: transition_block.transitions
        };
        body.defaults = {
            states: states_block.attrs,
            symbols: alphabet_block.attrs,
            transitions: transition_block.attrs
        };
        return body;
   }

states_block =
    name:("states" / "s") ws attrs:(attrs?) block_start states:states block_end
    {   
        let states_block = new Object();
        states_block.states =  states;
        states_block.attrs = {};
        setAttrs(states_block.attrs, attrs);
        return states_block; 
    }

states =
    state* 

state =
    name:$([a-zA-Z_0-9]+) attrs:(attrs?) ws
    {     
       let state = new Object();
       state.name = name;
       setAttrs(state, attrs);
       return state;
    }

alphabet_block =
    name:("alphabet" / "a") ws attrs:(attrs?) block_start alphabet:symbols block_end
    {  
        let alphabet_block = new Object();
        alphabet_block.symbols =  alphabet;
        alphabet_block.attrs = {};
        setAttrs(alphabet_block.attrs, attrs);
        return alphabet_block; 
        
    }

symbols =
    symbol*

symbol =
    name:$([a-zA-Z_]+) attrs:(attrs?) ws
    {  
       let symbol = new Object();
       symbol.name = name ;
       setAttrs(symbol, attrs);
       return symbol;
    }

transition_block =
    name:("transitions" / "t") ws attrs:(attrs?) block_start transitions:transitions block_end
    {  
        let transition_block = new Object();
        transition_block.transitions =  transitions;
        transition_block.attrs = {};
        setAttrs(transition_block.attrs, attrs);
        return transition_block; 
        
    }
    

transitions =
    transition*

transition =
    start:$([a-zA-Z_0-9]+)ws symbol:$([a-zA-Z_0-9]+)ws "->"  ws end:$([a-zA-Z_0-9]+)ws  atrs:(attrs?) ws
    {  
        let transition = new Object();
        transition.from =  start;
        transition.by =  symbol;
        transition.to =  end;
        setAttrs(transition, attrs);
        return transition;
        
    }



attrs =
    "[" attrs:(attr*) "]" ws { return attrs; }

attr =
    name:identifier ws "=" ws value:boolean ws { return {name: name, value: (value == "true") }; }
    / name:identifier ws "=" ws color:color ws { return {name: name, value: color }; }
    / name:identifier ws "=" ws value:quoted_string ws  { return { name: name, value: value }; } 
    / name:identifier ws { return {name: name, value: true};}
     

identifier =
    $([a-zA-Z]+)

string =
    identifier

quoted_string =
   "\"" str:$string "\"" { alert(str); return str; }

color =
    color:$("#" $(hexdigit hexdigit hexdigit hexdigit hexdigit hexdigit / hexdigit hexdigit hexdigit)) { return color }

hexdigit =
    ([a-fA-F0-9])

boolean = 
    "true"
    / "false"

block_start =
   "{" ws 

block_end =
    ws "}"

ws = 
    [ \t\n\r]* { return "ws" }
