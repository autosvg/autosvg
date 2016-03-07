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
    block_start blocks:(states:(state_block?) ws alphabet:(alphabet_block?)) block_end 
    { return blocks; }

state_block =
    name:("state" / "s") ws attrs:(attrs?) block_start states:states block_end
    { return states; }

states =
    state* 

state =
    name:$([a-zA-Z_]+) attrs*
    { return name; }

alphabet_block =
    name:("alphabet" / "a") ws attrs? block_start alphabet:symbols block_end
    { return alphabet; }

symbols =
    symbol*

symbol =
    name:$([a-zA-Z_]+) attrs*
    { return name; }

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
