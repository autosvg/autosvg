{
    function Block (name) {
        this.name = name;
    }

}

start =
    type:automaton_type ws attrs:(attrs?) body:automaton_body
    {   let automaton = new Block(type);
        automaton["attrs"] = attrs;
        automaton["body"] = body;
        return automaton;
    }

automaton_type =
    "finite automaton" / "fa"

automaton_body =
    block_start state_block:(state_block?) ws alphabet_block:(alphabet_block?) ws transition_block:(transition_block?) block_end 
    {   let body = new Block("body");
        body["state_block"] =  state_block;
        body["alphabet_block"] =  alphabet_block;
        body["transition_block"] =  transition_block;
        return body;
    }

state_block =
    name:("states" / "s") ws attrs:(attrs?) block_start states:states block_end
    {   let states_block = new Block(name);
        states_block["attrs"] =  attrs;
        states_block["states"] =  states;
        return states_block; 
    }

states =
    state* 

state =
    name:$([a-zA-Z_0-9]+) attrs:(attrs?) ws
    {  let state = new Block(name);
       state["attrs"] =  attrs ;
       return state;
    }

alphabet_block =
    name:("alphabet" / "a") ws attrs:(attrs?) block_start alphabet:symbols block_end
    {   let alphabet_block = new Block(name);
        alphabet_block["attrs"] =  attrs;
        alphabet_block["alphabet"] =  alphabet;
        return alphabet_block; 
    }

symbols =
    symbol*

symbol =
    name:$([a-zA-Z_]+) attrs:(attrs?) ws
    {  let symbol = new Block(name);
       symbol["attrs"] =  attrs ;
       return symbol;
    }

transition_block =
    name:("transitions" / "t") ws attrs:(attrs?) block_start transitions:transitions block_end
    {   let transition_block = new Block(name);
        transition_block["attrs"] =  attrs;
        transition_block["transitions"] =  transitions;
        return transition_block; 
    }
    

transitions =
    transition*

transition =
    start:$([a-zA-Z_0-9]+)ws symbol:$([a-zA-Z_0-9]+)ws "->"  ws end:$([a-zA-Z_0-9]+)ws  attrs:(attrs?) ws
    {   let transition = new Block();
        transition["start"] =  start;
        transition["symbol"] =  symbol;
        transition["end"] =  end;
        transition["attrs"] = attrs;
        return transition;
    }

attrs =
    "[" attrs:(attr*) "]" ws { return attrs; }

attr =
    name:$([a-zA-Z_]+) ws  
    { return name;}

block_start =
   "{" ws 

block_end =
    ws "}"

ws = 
    [ \t\n\r]* { return "ws" }
