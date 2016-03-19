{
    function Block (name) {
        this.name = name;
        this.contents = new Array();
    }

    Block.prototype.appendInformations = function(name, value) {
        log.debug(name);
        this.contents[name] = value;
    }
}

start =
    type:automaton_type ws attrs:(attrs?) body:automaton_body
    {   let automaton = new Block(type);
        automaton.appendInformations("attrs", attrs);
        automaton.appendInformations("body", body);
        return automaton;
    }

automaton_type =
    "finite automaton" / "fa"

automaton_body =
    block_start states:(state_block?) ws alphabet:(alphabet_block?) ws transitions:(transition_block?) block_end 
    {   let body = new Block("body");
        body.appendInformations("states", states);
        body.appendInformations("alphabet", alphabet);
        body.appendInformations("transitions", transitions);
        return body;
    }

state_block =
    name:("state" / "s") ws attrs:(attrs?) block_start states:states block_end
    {   let states_block = new Block(name);
        states_block.appendInformations("attrs", attrs);
        states_block.appendInformations("states", states);
        return states_block; 
    }

states =
    state* 

state =
    name:$([a-zA-Z_]+) attrs* ws
    { return name; }

alphabet_block =
    name:("alphabet" / "a") ws attrs? block_start alphabet:symbols block_end
    {   let alphabet_block = new Block(name);
        alphabet_block.appendInformations("attrs", attrs);
        alphabet_block.appendInformations("alphabet", alphabet);
        return alphabet_block; 
    }

symbols =
    symbol*

symbol =
    name:$([a-zA-Z_]+) attrs* ws
    { return name; }

transition_block =
    name:("transitions" / "t") ws attrs:(attrs?) block_start transitions:transitions block_end
    {   let transition_block = new Block(name);
        transition_block.appendInformations("attrs", attrs);
        transition_block.appendInformations("transitions", transitions);
        return transition_block; 
    }
    

transitions =
    transition*

transition =
    start:state symbol:symbol "->"  ws end:state ws
    {   let transition = new Block("t");
        transition.appendInformations("start", start);
        transition.appendInformations("symbol", symbol);
        transition.appendInformations("end", end);
        return transition;
    }

attrs =
    "[" attrs:(attr*) "]" ws { return attrs;  }

attr =
    name:$([a-zA-Z_]+) ws 
    { return name;}

block_start =
   "{" ws 

block_end =
    ws "}"

ws = 
    [ \t\n\r]* { return "ws" }
